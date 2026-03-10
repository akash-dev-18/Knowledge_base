package com.springboot.backend.mapper;

import com.springboot.backend.dto.response.DocumentResponse;
import com.springboot.backend.entity.Document;
import org.springframework.stereotype.Component;

@Component
public class DocumentMapper {

    public DocumentResponse toResponse(Document document) {
        return DocumentResponse.builder()
                .id(document.getId())
                .fileName(document.getFileName())
                .filePath(document.getFilePath())
                .fileSize(document.getFileSize())
                .status(document.getStatus().name())
                .workspaceName(document.getWorkspace() != null ? document.getWorkspace().getName() : null)
                .uploadedBy(document.getUser() != null ? document.getUser().getName() : null)
                .build();
    }
}