package com.springboot.backend.service;

import com.springboot.backend.dto.request.UploadDocumentRequest;
import com.springboot.backend.dto.response.DocumentResponse;
import com.springboot.backend.entity.Document;
import com.springboot.backend.entity.User;
import com.springboot.backend.entity.Workspace;
import com.springboot.backend.enums.DocumentStatus;
import com.springboot.backend.mapper.DocumentMapper;
import com.springboot.backend.repository.DocumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final DocumentMapper documentMapper;
    private final WorkspaceService workspaceService;
    private final UserService userService;

    @Transactional
    public DocumentResponse upload(UploadDocumentRequest request, UUID userId) {
        Workspace workspace = workspaceService.findByIdOrThrow(request.getWorkspaceId());
        User user = userService.findByIdOrThrow(userId);

        if (documentRepository.existsByFilePath(request.getFilePath())) {
            throw new RuntimeException("Document already exists: " + request.getFilePath());
        }

        Document document = documentRepository.save(
                Document.builder()
                        .fileName(request.getFileName())
                        .filePath(request.getFilePath())
                        .fileSize(request.getFileSize())
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
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document not found: " + id));
        documentRepository.delete(document);
    }

    public Document findByIdOrThrow(UUID id) {
        return documentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document not found: " + id));
    }
}