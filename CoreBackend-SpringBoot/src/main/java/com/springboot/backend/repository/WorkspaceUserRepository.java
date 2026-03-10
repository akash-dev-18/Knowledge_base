package com.springboot.backend.repository;

import com.springboot.backend.entity.WorkspaceUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface WorkspaceUserRepository extends JpaRepository<WorkspaceUser, UUID> {

    List<WorkspaceUser> findByWorkspaceId(UUID workspaceId);
    List<WorkspaceUser> findByUserId(UUID userId);
    Optional<WorkspaceUser> findByUserIdAndWorkspaceId(UUID userId, UUID workspaceId);
    boolean existsByUserIdAndWorkspaceId(UUID userId, UUID workspaceId);
}