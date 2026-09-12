package com.example.newbie.api.route;

import com.example.newbie.api.route.dto.RouteRequest;
import com.example.newbie.api.route.dto.RouteResponse;
import com.example.newbie.application.route.RouteService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class RouteController {

    private final RouteService routeService;

    public RouteController(RouteService routeService) {
        this.routeService = routeService;
    }

    @PostMapping("/api/v1/routes")
    public RouteResponse createRoute(@Valid @RequestBody RouteRequest request) {
        return routeService.createRoute(request);
    }
}
