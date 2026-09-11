package com.example.newbie.domain.sample;

import com.example.newbie.common.exception.BusinessException;
import com.example.newbie.common.exception.ErrorCode;

public class SampleNotFoundException extends BusinessException {

    public SampleNotFoundException(Long id) {
        super(ErrorCode.SAMPLE_NOT_FOUND);
    }
}
