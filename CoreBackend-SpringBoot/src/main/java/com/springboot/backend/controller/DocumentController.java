package com.springboot.backend.controller;

import com.springboot.backend.dto.request.UploadDocumentRequest;
import com.springboot.backend.dto.response.DocumentResponse;
import com.springboot.backend.entity.User;
import com.springboot.backend.enums.DocumentStatus;
import com.springboot.backend.service.DocumentService;
import com.springboot.backend.util.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;
    private final SecurityUtils securityUtils;

    @PostMapping
    public ResponseEntity<DocumentResponse> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam("workspaceId") UUID workspaceId
    ) {
        User currentUser = securityUtils.getCurrentUser();
        return ResponseEntity.status(201).body(
                documentService.upload(file, workspaceId, currentUser.getId())
        );
    }

    @GetMapping("/workspace/{workspaceId}")
    public ResponseEntity<List<DocumentResponse>> getAllByWorkspace(
            @PathVariable UUID workspaceId
    ) {
        return ResponseEntity.ok(documentService.getAllByWorkspace(workspaceId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DocumentResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(documentService.getById(id));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<DocumentResponse> updateStatus(
            @PathVariable UUID id,
            @RequestParam DocumentStatus status
    ) {
        return ResponseEntity.ok(documentService.updateStatus(id, status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        documentService.delete(id);
        return ResponseEntity.noContent().build();
    }
}