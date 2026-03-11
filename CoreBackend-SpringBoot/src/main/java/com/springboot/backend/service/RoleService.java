package com.springboot.backend.service;

import com.springboot.backend.entity.Role;
import com.springboot.backend.repository.CompanyRepository;
import com.springboot.backend.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RoleService {

    private final RoleRepository roleRepository;
    private final CompanyRepository companyRepository;

    @Transactional
    public Role create(String name, UUID companyId) {
        if (roleRepository.existsByNameAndCompanyId(name, companyId)) {
            throw new RuntimeException("Role already exists: " + name);
        }
        return roleRepository.save(
                Role.builder()
                        .name(name)
                        .company(companyRepository.findById(companyId)
                                .orElseThrow(() -> new RuntimeException("Company not found")))
                        .build()
        );
    }

    public Role findByNameAndCompanyOrThrow(String name, UUID companyId) {
        return roleRepository.findByNameAndCompanyId(name, companyId)
                .orElseThrow(() -> new RuntimeException("Role not found: " + name));
    }
}