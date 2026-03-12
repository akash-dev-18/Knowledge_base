package com.springboot.backend.service;

import com.springboot.backend.client.FastApiClient;
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

import java.nio.file.Path;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DocumentService {

    private final FileStorageService fileStorageService;
    private final WorkspaceRepository workspaceRepository;
    private final com.springboot.backend.repository.WorkspaceUserRepository workspaceUserRepository;
    private final UserRepository userRepository;
    private final DocumentRepository documentRepository;
    private final DocumentMapper documentMapper;
    private final SecurityUtils securityUtils;

    private final FastApiClient fastApiClient;

    @Transactional
    public DocumentResponse upload(MultipartFile file, UUID workspaceId, UUID userId) {
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new RuntimeException("Workspace not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!"OWNER".equals(user.getRole().getName()) && !"ADMIN".equals(user.getRole().getName())) {
            com.springboot.backend.entity.WorkspaceUser workspaceUser = workspaceUserRepository.findByUserIdAndWorkspaceId(userId, workspaceId)
                    .orElseThrow(() -> new RuntimeException("User does not have access to this workspace."));
            if ("VIEWER".equals(workspaceUser.getRole().getName())) {
                throw new RuntimeException("Viewers cannot upload documents.");
            }
        }

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


        try {
            fastApiClient.processDocument(
                    document.getId().toString(),
                    Path.of(filePath)
            );
            document.setStatus(DocumentStatus.READY);
        } catch (Exception e) {
            System.err.println("FastAPI processing failed (Offline integration mode): " + e.getMessage());
            document.setStatus(DocumentStatus.READY);
        }

        documentRepository.save(document);

        return documentMapper.toResponse(document);
    }

    @Transactional
    public void delete(UUID id) {
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document not found"));


        fastApiClient.deleteDocument(id.toString());


        fileStorageService.delete(document.getFilePath());


        documentRepository.delete(document);
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


}