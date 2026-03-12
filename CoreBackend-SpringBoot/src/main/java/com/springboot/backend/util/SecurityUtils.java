package com.springboot.backend.util;

import com.springboot.backend.entity.User;
import com.springboot.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SecurityUtils {

    private final UserRepository userRepository;

    public User getCurrentUser() {
        String email = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }


    // roel checker
    public void requireRole(String... allowedRoles) {
        String userRole = getCurrentUser().getRole().getName();

        for (String role : allowedRoles) {
            if (role.equals(userRole)) return;
        }

        throw new RuntimeException("Access denied");
    }
}