package com.springboot.backend.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

@Getter
@Builder
public class UserResponse {
    private UUID id;
    private String name;
    private String email;
    private String status;
    private String roleName;
    private String companyName;
}