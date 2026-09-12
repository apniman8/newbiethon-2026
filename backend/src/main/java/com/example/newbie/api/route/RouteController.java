package com.example.newbie.api.route;

import com.example.newbie.api.route.dto.RouteRequest;
import com.example.newbie.api.route.dto.v12.RouteV12Response;
import com.example.newbie.application.route.RouteProvider;
import com.example.newbie.application.route.RouteQuery;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/routes")
public class RouteController {

    private final RouteProvider routeProvider;

    public RouteController(RouteProvider routeProvider) {
        this.routeProvider = routeProvider;
    }

    @PostMapping
    public ResponseEntity<RouteV12Response> findRoute(@Valid @RequestBody RouteRequest request) {
        RouteQuery query = new RouteQuery(
                request.mapId(),
                request.startPlaceId(),
                request.destinationPlaceId(),
                request.profile()
        );
        return ResponseEntity.ok(RouteV12Response.from(routeProvider.findRoute(query)));
    }
}
