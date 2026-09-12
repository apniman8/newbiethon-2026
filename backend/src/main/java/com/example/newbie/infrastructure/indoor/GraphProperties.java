package com.example.newbie.infrastructure.indoor;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.graph")
public record GraphProperties(String location) {
}
