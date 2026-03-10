package com.springboot.backend.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AuthResponse {
    private String accessToken;
    private String tokenType;       // always "Bearer"
    private UserResponse user;
}