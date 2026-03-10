package com.springboot.backend.repository;

import com.springboot.backend.entity.Document;
import com.springboot.backend.enums.DocumentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DocumentRepository extends JpaRepository<Document, UUID> {

    List<Document> findByWorkspaceId(UUID workspaceId);
    List<Document> findByUserId(UUID userId);
    List<Document> findByWorkspaceIdAndStatus(UUID workspaceId, DocumentStatus status);
    boolean existsByFilePath(String filePath);
}
