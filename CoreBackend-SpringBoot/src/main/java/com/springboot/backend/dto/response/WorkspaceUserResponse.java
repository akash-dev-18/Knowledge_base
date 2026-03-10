package com.springboot.backend.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
public class WorkspaceUserResponse {
    private UUID userId;
    private String userName;
    private String userEmail;
    private String roleName;
    private LocalDateTime joinedAt;
}