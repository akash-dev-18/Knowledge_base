package com.springboot.backend.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

@Getter
@Builder
public class RoleResponse {
    private UUID id;
    private String name;
}