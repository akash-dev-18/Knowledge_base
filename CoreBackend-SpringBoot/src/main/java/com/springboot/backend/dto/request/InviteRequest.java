package com.springboot.backend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class InviteRequest {
    @NotBlank
    private String name;
    
    @Email
    private String email;
    
    @Size(min = 8)
    private String password;
    
    @NotBlank
    private String roleName;  
}