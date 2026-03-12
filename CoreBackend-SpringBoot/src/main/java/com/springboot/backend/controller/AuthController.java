package com.springboot.backend.controller;

import com.springboot.backend.dto.request.InviteRequest;
import com.springboot.backend.dto.request.LoginRequest;
import com.springboot.backend.dto.request.RegisterRequest;
import com.springboot.backend.dto.response.AuthResponse;
import com.springboot.backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

@PostMapping("/invite")
public ResponseEntity<AuthResponse> invite(
    @Valid @RequestBody InviteRequest request
) {
    return ResponseEntity.status(201).body(authService.invite(request));
}
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(201).body(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }
}
