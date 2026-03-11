package com.springboot.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginRequest {
    @NotBlank(message = "email is required")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8,message = "min 8 length password")
    private String passwordHash;
}
