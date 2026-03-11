package com.springboot.backend.service;

import com.springboot.backend.dto.request.LoginRequest;
import com.springboot.backend.dto.request.RegisterRequest;
import com.springboot.backend.dto.response.AuthResponse;
import com.springboot.backend.entity.Company;
import com.springboot.backend.entity.Role;
import com.springboot.backend.entity.User;
import com.springboot.backend.enums.UserStatus;
import com.springboot.backend.mapper.UserMapper;
import com.springboot.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthService {

    private final UserRepository userRepository;
    private final CompanyService companyService;
    private final RoleService roleService;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists: " + request.getEmail());
        }

        Company company = companyService.create(
                request.getCompanyName(),
                request.getDescription()
        );

        Role ownerRole = roleService.create("OWNER", company.getId());

        User user = userRepository.save(
                User.builder()
                        .name(request.getName())
                        .email(request.getEmail())
                        .passwordHash(passwordEncoder.encode(request.getPassword()))
                        .company(company)
                        .role(ownerRole)
                        .userStatus(UserStatus.ACTIVE)
                        .build()
        );

        String token = jwtService.generateToken(user.getId(), user.getEmail());

        return AuthResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .user(userMapper.toResponse(user))
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPasswordHash(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid email or password");
        }

        String token = jwtService.generateToken(user.getId(), user.getEmail());

        return AuthResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .user(userMapper.toResponse(user))
                .build();
    }
}