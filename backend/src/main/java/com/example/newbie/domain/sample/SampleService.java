package com.example.newbie.domain.sample;

import com.example.newbie.domain.sample.dto.SampleCreateRequest;
import com.example.newbie.domain.sample.dto.SampleResponse;
import com.example.newbie.domain.sample.dto.SampleUpdateRequest;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class SampleService {

    private final SampleRepository sampleRepository;

    public SampleService(SampleRepository sampleRepository) {
        this.sampleRepository = sampleRepository;
    }

    @Transactional
    public SampleResponse create(SampleCreateRequest request) {
        Sample sample = Sample.create(request.title(), request.content());
        return SampleResponse.from(sampleRepository.saveAndFlush(sample));
    }

    public SampleResponse getById(Long id) {
        return SampleResponse.from(findById(id));
    }

    public List<SampleResponse> getAll() {
        return sampleRepository.findAll(Sort.by(Sort.Direction.DESC, "id"))
                .stream()
                .map(SampleResponse::from)
                .toList();
    }

    @Transactional
    public SampleResponse update(Long id, SampleUpdateRequest request) {
        Sample sample = findById(id);
        sample.update(request.title(), request.content());
        sampleRepository.flush();
        return SampleResponse.from(sample);
    }

    @Transactional
    public void delete(Long id) {
        sampleRepository.delete(findById(id));
    }

    private Sample findById(Long id) {
        return sampleRepository.findById(id)
                .orElseThrow(() -> new SampleNotFoundException(id));
    }
}
