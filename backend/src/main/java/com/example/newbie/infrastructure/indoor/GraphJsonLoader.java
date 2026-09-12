package com.example.newbie.infrastructure.indoor;

import com.example.newbie.domain.indoor.GraphDataException;
import com.example.newbie.domain.indoor.model.StationMap;
import java.io.IOException;
import java.io.InputStream;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Component;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.ObjectMapper;

@Component
public class GraphJsonLoader {

    private final ResourceLoader resourceLoader;
    private final ObjectMapper objectMapper;

    public GraphJsonLoader(ResourceLoader resourceLoader, ObjectMapper objectMapper) {
        this.resourceLoader = resourceLoader;
        this.objectMapper = objectMapper;
    }

    public StationMap load(String location) {
        Resource resource = resourceLoader.getResource(location);
        try (InputStream inputStream = resource.getInputStream()) {
            return objectMapper.readValue(inputStream, StationMap.class);
        } catch (IOException e) {
            throw new GraphDataException("Failed to load station map from " + location, e);
        } catch (JacksonException e) {
            throw new GraphDataException("Failed to parse station map from " + location, e);
        }
    }
}
