package com.example.newbie.api.admin;

import com.example.newbie.api.admin.dto.GraphPatchRequest;
import com.example.newbie.api.admin.dto.GraphPatchResponse;
import com.example.newbie.application.admin.AdminGraphService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Backs the NodeEditorScreen "save" action. Internal tool only — gated by a
 * single shared-secret header, never meant to be exposed on a public,
 * unauthenticated deployment. See AdminGraphService for what "save" means.
 */
@RestController
@RequestMapping("/api/v1/admin/maps/{mapId}/graph")
public class AdminMapController {

    private final AdminGraphService adminGraphService;

    public AdminMapController(AdminGraphService adminGraphService) {
        this.adminGraphService = adminGraphService;
    }

    @PatchMapping
    public GraphPatchResponse patchGraph(
            @PathVariable String mapId,
            @RequestHeader(value = "X-Admin-Key", required = false) String adminKey,
            @Valid @RequestBody GraphPatchRequest patch
    ) {
        adminGraphService.requireValidKey(adminKey);
        return adminGraphService.applyPatch(mapId, patch);
    }
}
