package com.springboot.backend.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

@Getter
@Builder
public class DocumentResponse {
    private UUID id;
    private String fileName;
    private String filePath;
    private long fileSize;
    private String status;
    private String workspaceName;
    private String uploadedBy;
}