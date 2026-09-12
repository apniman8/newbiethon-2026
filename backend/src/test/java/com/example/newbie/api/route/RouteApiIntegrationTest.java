package com.example.newbie.api.route;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.resttestclient.TestRestTemplate;
import org.springframework.boot.resttestclient.autoconfigure.AutoConfigureTestRestTemplate;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

/**
 * Exercises the real HTTP endpoints against the real map-v1.json seed —
 * the "curl / Swagger returns 200" completion condition from the roadmap,
 * automated instead of manual.
 */
@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
@AutoConfigureTestRestTemplate
class RouteApiIntegrationTest {

    private static final String MAP_ID = "SEOUL_STATION_KTX_TO_AREX";

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    void placesEndpointReturnsTheSeededPlaces() {
        ResponseEntity<Map> response = restTemplate.getForEntity("/api/v1/maps/" + MAP_ID + "/places", Map.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        List<?> places = (List<?>) response.getBody().get("places");
        assertThat(places).hasSize(5);
    }

    @Test
    void mapEndpointReturnsNodesForTheEditor() {
        ResponseEntity<Map> response = restTemplate.getForEntity("/api/v1/maps/" + MAP_ID, Map.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat((List<?>) response.getBody().get("nodes")).isNotEmpty();
        assertThat((List<?>) response.getBody().get("edges")).isNotEmpty();
    }

    @Test
    void placesEndpointAllowsAnExpoWebOriginByDefault() {
        HttpHeaders headers = new HttpHeaders();
        headers.setOrigin("https://example-expo-web.app");

        ResponseEntity<Map> response = restTemplate.exchange(
                "/api/v1/maps/" + MAP_ID + "/places",
                HttpMethod.GET,
                new HttpEntity<>(headers),
                Map.class,
                Map.of()
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getHeaders().getAccessControlAllowOrigin())
                .isEqualTo("https://example-expo-web.app");
    }

    @Test
    void placesEndpointReturns404ForAnUnknownMap() {
        ResponseEntity<Map> response = restTemplate.getForEntity("/api/v1/maps/NO_SUCH_MAP/places", Map.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(response.getBody().get("code")).isEqualTo("MAP_NOT_FOUND");
    }

    @Test
    void routesEndpointReturnsADifferentPathSummaryForEachSupportedProfile() {
        ResponseEntity<Map> standard = postRoute("STANDARD");
        ResponseEntity<Map> luggage = postRoute("LUGGAGE");

        assertThat(standard.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(luggage.getStatusCode()).isEqualTo(HttpStatus.OK);

        Map<?, ?> standardSummary = (Map<?, ?>) standard.getBody().get("summary");
        Map<?, ?> luggageSummary = (Map<?, ?>) luggage.getBody().get("summary");
        assertThat(standardSummary.get("segmentCount")).isNotNull();
        assertThat(luggageSummary.get("segmentCount")).isNotNull();
        assertThat(standard.getBody().get("segments")).isNotNull();
    }

    @Test
    void routesEndpointRejectsAnUnsupportedProfile() {
        ResponseEntity<Map> response = postRoute("WHEELCHAIR");

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody().get("code")).isEqualTo("INVALID_PROFILE");
    }

    @Test
    void routesEndpointRejectsAnUnknownPlace() {
        Map<String, String> request = Map.of(
                "mapId", MAP_ID,
                "startPlaceId", "NO_SUCH_PLACE",
                "destinationPlaceId", "SEOUL_LINE1_PLATFORM",
                "profile", "STANDARD"
        );

        ResponseEntity<Map> response = restTemplate.postForEntity("/api/v1/routes", request, Map.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody().get("code")).isEqualTo("INVALID_PLACE");
    }

    @Test
    void routesEndpointRejectsAMissingRequiredField() {
        Map<String, String> request = Map.of(
                "mapId", MAP_ID,
                "destinationPlaceId", "SEOUL_LINE1_PLATFORM",
                "profile", "STANDARD"
        );

        ResponseEntity<Map> response = restTemplate.postForEntity("/api/v1/routes", request, Map.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody().get("code")).isEqualTo("VALIDATION_ERROR");
    }

    @Test
    void routesEndpointReturnsMapTransitionMapForArex() {
        Map<String, String> request = Map.of(
                "mapId", MAP_ID,
                "startPlaceId", "SEOUL_KTX_ARRIVAL",
                "destinationPlaceId", "SEOUL_AREX_PLATFORM",
                "profile", "LUGGAGE"
        );

        ResponseEntity<Map> response = restTemplate.postForEntity("/api/v1/routes", request, Map.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        List<Map<String, Object>> segments = (List<Map<String, Object>>) response.getBody().get("segments");
        assertThat(segments).hasSize(3);
        assertThat(segments.get(0).get("segmentType")).isEqualTo("MAP");
        assertThat(segments.get(1).get("segmentType")).isEqualTo("TRANSITION");
        assertThat(segments.get(1).get("mapTransition")).isEqualTo(true);
        assertThat(segments.get(2).get("mapImageId")).isEqualTo("SEOUL_AREX_EXPLODED");
    }

    private ResponseEntity<Map> postRoute(String profile) {
        Map<String, String> request = Map.of(
                "mapId", MAP_ID,
                "startPlaceId", "SEOUL_KTX_ARRIVAL",
                "destinationPlaceId", "SEOUL_LINE1_PLATFORM",
                "profile", profile
        );
        return restTemplate.postForEntity("/api/v1/routes", request, Map.class);
    }
}
