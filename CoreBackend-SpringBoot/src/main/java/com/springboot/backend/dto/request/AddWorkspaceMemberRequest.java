package com.springboot.backend.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class AddWorkspaceMemberRequest {

    @NotNull(message = "User id is required")
    private UUID userId;

    @NotNull(message = "Role id is required")
    private UUID roleId;
}