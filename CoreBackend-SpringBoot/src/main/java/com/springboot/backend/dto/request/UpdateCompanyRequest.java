package com.springboot.backend.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateCompanyRequest {
    private String name;
    private String description;
    private String logoUrl;
}