package com.example.newbie.application.route;

public interface RouteProvider {

    RoutePlan findRoute(RouteQuery query);
}
