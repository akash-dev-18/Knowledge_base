package com.springboot.backend.dto.request;


import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import lombok.Singular;

@Getter
@Setter
public class RegisterRequest {
    @NotBlank(message = "Company name is required")
    private String companyName;

    @NotBlank(message = "Your name is required")
    private String name;

    @Email(message = "Invalid email ")
    @NotBlank(message = "Email is required")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min=8,message = "Password must be of 8 character")
    private String password;

}
