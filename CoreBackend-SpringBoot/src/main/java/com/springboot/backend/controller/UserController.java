package com.springboot.backend.controller;

import com.springboot.backend.dto.request.UpdateUserRequest;
import com.springboot.backend.dto.response.UserResponse;
import com.springboot.backend.entity.User;
import com.springboot.backend.service.UserService;
import com.springboot.backend.util.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final SecurityUtils securityUtils;

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getMe() {
        User currentUser = securityUtils.getCurrentUser();
        return ResponseEntity.ok(userService.getById(currentUser.getId()));
    }

    @GetMapping
    public ResponseEntity<List<UserResponse>> getAllByCompany() {
        User currentUser = securityUtils.getCurrentUser();
        return ResponseEntity.ok(userService.getAllByCompany(currentUser.getCompany().getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(userService.getById(id));
    }

    @PatchMapping("/me")
    public ResponseEntity<UserResponse> update(
            @RequestBody UpdateUserRequest request
    ) {
        User currentUser = securityUtils.getCurrentUser();
        return ResponseEntity.ok(userService.update(currentUser.getId(), request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        userService.delete(id);
        return ResponseEntity.noContent().build();
    }
}