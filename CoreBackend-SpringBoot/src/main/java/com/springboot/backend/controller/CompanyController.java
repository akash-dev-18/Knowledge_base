package com.springboot.backend.controller;

import com.springboot.backend.dto.request.UpdateCompanyRequest;
import com.springboot.backend.dto.response.CompanyResponse;
import com.springboot.backend.service.CompanyService;
import com.springboot.backend.service.JwtService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/companies")
@RequiredArgsConstructor
public class CompanyController {

    private final CompanyService companyService;
    private final JwtService jwtService;

    @GetMapping("/{id}")
    public ResponseEntity<CompanyResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(companyService.getById(id));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<CompanyResponse> update(
            @PathVariable UUID id,
            @RequestBody UpdateCompanyRequest request
    ) {
        return ResponseEntity.ok(companyService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        companyService.delete(id);
        return ResponseEntity.noContent().build();
    }
}