package com.springboot.backend.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

@Getter
@Builder
public class WorkspaceResponse {
    private UUID id;
    private String name;
    private String description;
    private String companyName;
    private int memberCount;
}