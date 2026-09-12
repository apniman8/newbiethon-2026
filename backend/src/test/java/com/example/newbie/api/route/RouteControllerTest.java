package com.example.newbie.api.route;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.example.newbie.infrastructure.route.mock.MockRouteProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

class RouteControllerTest {

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .standaloneSetup(new RouteController(new MockRouteProvider()))
                .build();
    }

    @Test
    void returnsTheV12MapTransitionMapContract() throws Exception {
        mockMvc.perform(post("/api/v1/routes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "mapId": "SEOUL_STATION_KTX_TO_AREX",
                                  "startPlaceId": "SEOUL_KTX_ARRIVAL",
                                  "destinationPlaceId": "SEOUL_AREX_PLATFORM",
                                  "profile": "LUGGAGE"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.apiVersion").value("v1.2"))
                .andExpect(jsonPath("$.segments.length()").value(3))
                .andExpect(jsonPath("$.segments[0].segmentType").value("MAP"))
                .andExpect(jsonPath("$.segments[1].segmentType").value("TRANSITION"))
                .andExpect(jsonPath("$.segments[1].mapTransition").value(true))
                .andExpect(jsonPath("$.segments[2].mapImageId")
                        .value("SEOUL_AREX_EXPLODED"));
    }
}
