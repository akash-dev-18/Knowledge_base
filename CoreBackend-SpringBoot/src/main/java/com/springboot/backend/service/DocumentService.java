package com.springboot.backend.service;

import com.springboot.backend.dto.response.DocumentResponse;
import com.springboot.backend.entity.Document;
import com.springboot.backend.entity.User;
import com.springboot.backend.entity.Workspace;
import com.springboot.backend.enums.DocumentStatus;
import com.springboot.backend.mapper.DocumentMapper;
import com.springboot.backend.repository.DocumentRepository;
import com.springboot.backend.repository.UserRepository;
import com.springboot.backend.repository.WorkspaceRepository;
import com.springboot.backend.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DocumentService {

    private final FileStorageService fileStorageService;
    private final WorkspaceRepository workspaceRepository;
    private final UserRepository userRepository;
    private final DocumentRepository documentRepository;
    private final DocumentMapper documentMapper;
    private final SecurityUtils securityUtils;

    @Transactional
    public DocumentResponse upload(MultipartFile file, UUID workspaceId, UUID userId) {
        securityUtils.requireRole("OWNER", "ADMIN", "MEMBER");
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new RuntimeException("Workspace not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String filePath = fileStorageService.save(file);

        Document document = documentRepository.save(
                Document.builder()
                        .fileName(file.getOriginalFilename())
                        .filePath(filePath)
                        .fileSize(file.getSize())
                        .workspace(workspace)
                        .user(user)
                        .status(DocumentStatus.UPLOADING)
                        .build()
        );

        return documentMapper.toResponse(document);
    }

    public List<DocumentResponse> getAllByWorkspace(UUID workspaceId) {
        return documentRepository.findByWorkspaceId(workspaceId)
                .stream()
                .map(documentMapper::toResponse)
                .toList();
    }

    public DocumentResponse getById(UUID id) {
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document not found: " + id));
        return documentMapper.toResponse(document);
    }

    @Transactional
    public DocumentResponse updateStatus(UUID id, DocumentStatus status) {
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document not found: " + id));
        document.setStatus(status);
        return documentMapper.toResponse(document);
    }

    @Transactional
    public void delete(UUID id) {
        securityUtils.requireRole("OWNER", "ADMIN", "MEMBER");
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document not found"));
        documentRepository.delete(document);
        fileStorageService.delete(document.getFilePath());
    }
}