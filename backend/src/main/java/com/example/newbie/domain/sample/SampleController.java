package com.example.newbie.domain.sample;

import com.example.newbie.domain.sample.dto.SampleCreateRequest;
import com.example.newbie.domain.sample.dto.SampleResponse;
import com.example.newbie.domain.sample.dto.SampleUpdateRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/samples")
@Tag(name = "Sample", description = "범용 CRUD 예제 API")
public class SampleController {

    private final SampleService sampleService;

    public SampleController(SampleService sampleService) {
        this.sampleService = sampleService;
    }

    @PostMapping
    @Operation(summary = "Sample 생성")
    public ResponseEntity<SampleResponse> create(@Valid @RequestBody SampleCreateRequest request) {
        SampleResponse response = sampleService.create(request);
        return ResponseEntity
                .created(URI.create("/api/samples/" + response.id()))
                .body(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Sample 단건 조회")
    public SampleResponse getById(@PathVariable Long id) {
        return sampleService.getById(id);
    }

    @GetMapping
    @Operation(summary = "Sample 전체 조회")
    public List<SampleResponse> getAll() {
        return sampleService.getAll();
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Sample 수정")
    public SampleResponse update(
            @PathVariable Long id,
            @Valid @RequestBody SampleUpdateRequest request
    ) {
        return sampleService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Sample 삭제")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        sampleService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
