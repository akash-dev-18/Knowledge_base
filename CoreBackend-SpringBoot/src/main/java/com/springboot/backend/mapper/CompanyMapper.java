package com.springboot.backend.mapper;

import com.springboot.backend.dto.response.CompanyResponse;
import com.springboot.backend.entity.Company;
import org.springframework.stereotype.Component;

@Component
public class CompanyMapper {

    public CompanyResponse toResponse(Company company) {
        return CompanyResponse.builder()
                .id(company.getId())
                .name(company.getName())
                .description(company.getDescription())
                .logoUrl(company.getLogoUrl())
                .build();
    }
}