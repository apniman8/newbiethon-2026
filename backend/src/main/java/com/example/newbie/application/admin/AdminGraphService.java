package com.example.newbie.application.admin;

import com.example.newbie.api.admin.dto.EdgeGeometryPatchRequest;
import com.example.newbie.api.admin.dto.GraphPatchRequest;
import com.example.newbie.api.admin.dto.GraphPatchResponse;
import com.example.newbie.api.admin.dto.NodePatchRequest;
import com.example.newbie.common.exception.BusinessException;
import com.example.newbie.common.exception.ErrorCode;
import com.example.newbie.domain.indoor.model.GraphEdge;
import com.example.newbie.domain.indoor.model.GraphNode;
import com.example.newbie.domain.indoor.model.ImagePoint;
import com.example.newbie.domain.indoor.model.StationMap;
import com.example.newbie.domain.indoor.repository.GraphRepository;
import com.example.newbie.infrastructure.indoor.AdminGraphProperties;
import com.example.newbie.infrastructure.indoor.GraphProperties;
import com.example.newbie.infrastructure.indoor.GraphValidator;
import java.nio.file.Path;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.ObjectMapper;

/**
 * Applies node/edge patches from the NodeEditorScreen to map-v1.json.
 *
 * By design this only writes the file — it does NOT hot-swap the in-memory
 * StationMap that JsonGraphRepository already handed out to every other bean
 * (that map is deliberately immutable so a live request's routing can never
 * be mutated mid-flight). A saved patch takes effect the next time the app
 * restarts and JsonGraphRepository reloads the file. This also means writing
 * only works when running from a source checkout (classpath:... resolves to
 * a real file); it will fail from inside a packaged jar.
 */
@Service
public class AdminGraphService {

    private final GraphRepository graphRepository;
    private final GraphValidator graphValidator;
    private final AdminGraphProperties adminGraphProperties;
    private final GraphProperties graphProperties;
    private final ObjectMapper objectMapper;

    public AdminGraphService(
            GraphRepository graphRepository,
            GraphValidator graphValidator,
            AdminGraphProperties adminGraphProperties,
            GraphProperties graphProperties,
            ObjectMapper objectMapper
    ) {
        this.graphRepository = graphRepository;
        this.graphValidator = graphValidator;
        this.adminGraphProperties = adminGraphProperties;
        this.graphProperties = graphProperties;
        this.objectMapper = objectMapper;
    }

    public void requireValidKey(String providedKey) {
        if (!adminGraphProperties.matches(providedKey)) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED);
        }
    }

    public GraphPatchResponse applyPatch(String mapId, GraphPatchRequest patch) {
        StationMap current = graphRepository.findById(mapId)
                .orElseThrow(() -> new BusinessException(ErrorCode.MAP_NOT_FOUND));

        Map<String, GraphNode> nodesById = new LinkedHashMap<>();
        for (GraphNode node : current.nodes()) {
            nodesById.put(node.id(), node);
        }
        for (NodePatchRequest nodePatch : patch.nodes()) {
            GraphNode existing = nodesById.get(nodePatch.id());
            if (existing == null) {
                throw new BusinessException(ErrorCode.GRAPH_DATA_INVALID, "Unknown node id: " + nodePatch.id());
            }
            nodesById.put(existing.id(), new GraphNode(
                    existing.id(),
                    existing.nodeType(),
                    existing.floor(),
                    existing.mapImageId(),
                    nodePatch.imageX(),
                    nodePatch.imageY(),
                    existing.description(),
                    existing.facilityId()
            ));
        }

        Map<String, GraphEdge> edgesById = new LinkedHashMap<>();
        for (GraphEdge edge : current.edges()) {
            edgesById.put(edge.id(), edge);
        }
        for (EdgeGeometryPatchRequest edgePatch : patch.edges()) {
            GraphEdge existing = edgesById.get(edgePatch.id());
            if (existing == null) {
                throw new BusinessException(ErrorCode.GRAPH_DATA_INVALID, "Unknown edge id: " + edgePatch.id());
            }
            List<ImagePoint> geometry = edgePatch.geometry().stream()
                    .map(point -> new ImagePoint(point.x(), point.y()))
                    .toList();
            edgesById.put(existing.id(), new GraphEdge(
                    existing.id(),
                    existing.fromNodeId(),
                    existing.toNodeId(),
                    existing.distanceMeters(),
                    existing.baseDurationSeconds(),
                    existing.movementType(),
                    existing.instruction(),
                    existing.reverseInstruction(),
                    existing.facilityId(),
                    existing.accessible(),
                    geometry
            ));
        }

        StationMap patched = new StationMap(
                current.mapId(),
                current.version(),
                current.demoData(),
                current.facilityDataStatus(),
                current.supportedProfiles(),
                current.mapImages(),
                current.places(),
                List.copyOf(nodesById.values()),
                List.copyOf(edgesById.values()),
                current.facilities()
        );

        // Fail before touching the file: a patch that breaks the graph
        // (dangling geometry, disconnected place, etc.) must not overwrite
        // a known-good map-v1.json.
        graphValidator.validate(patched);
        Path file = resolveSourceFile();
        writeToFile(file, patched);

        return new GraphPatchResponse(
                "Saved to " + file + ". Restart the server to apply it to routing.",
                patch.nodes().size(),
                patch.edges().size(),
                true
        );
    }

    // app.graph.location is a classpath: URI. Resolving it through
    // ResourceLoader at runtime lands on the *compiled* copy under
    // target/classes, not the source tree — writing there is invisible to
    // git and gets clobbered by the next `mvn compile`. Admin edits need to
    // land in src/main/resources so they survive a rebuild and can be
    // committed.
    private Path resolveSourceFile() {
        String location = graphProperties.location();
        String prefix = "classpath:";
        if (!location.startsWith(prefix)) {
            throw new BusinessException(
                    ErrorCode.INTERNAL_SERVER_ERROR,
                    "app.graph.location must start with '" + prefix + "' to resolve a source file for writing: " + location
            );
        }
        return Path.of("src/main/resources", location.substring(prefix.length()));
    }

    private void writeToFile(Path file, StationMap map) {
        try {
            objectMapper.writerWithDefaultPrettyPrinter().writeValue(file.toFile(), map);
        } catch (JacksonException e) {
            throw new BusinessException(
                    ErrorCode.INTERNAL_SERVER_ERROR,
                    "Could not write " + file + " (only works from a source checkout, not a packaged jar): " + e.getMessage()
            );
        }
    }
}
