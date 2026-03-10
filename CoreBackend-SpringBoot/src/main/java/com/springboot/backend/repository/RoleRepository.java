package com.springboot.backend.repository;

import com.springboot.backend.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RoleRepository extends JpaRepository<Role, UUID> {

    Optional<Role> findByNameAndCompanyId(String name, UUID companyId);
    List<Role> findByCompanyId(UUID companyId);
    boolean existsByNameAndCompanyId(String name, UUID companyId);
}