package com.example.newbie.infrastructure.indoor;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Shared-secret gate for the graph-editing admin endpoints. Blank (the
 * default) means the admin endpoints are effectively disabled — every
 * request is rejected since no caller-supplied key can equal a blank one.
 */
@ConfigurationProperties(prefix = "app.admin")
public record AdminGraphProperties(String key) {

    public AdminGraphProperties {
        key = key == null ? "" : key;
    }

    public boolean matches(String providedKey) {
        return !key.isBlank() && key.equals(providedKey);
    }
}
