package com.springboot.backend.repository;

import com.springboot.backend.entity.Workspace;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface WorkspaceRepository extends JpaRepository<Workspace, UUID> {

    List<Workspace> findByCompanyId(UUID companyId);
    boolean existsByNameAndCompanyId(String name, UUID companyId);
}