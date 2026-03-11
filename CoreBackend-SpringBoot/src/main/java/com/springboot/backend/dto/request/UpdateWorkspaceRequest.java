package com.springboot.backend.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateWorkspaceRequest {
    private String name;
    private String description;
}