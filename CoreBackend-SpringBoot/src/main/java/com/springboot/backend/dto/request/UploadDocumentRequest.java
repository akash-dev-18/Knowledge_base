package com.springboot.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class UploadDocumentRequest {
    @NotBlank(message = "filename required")
    private String fileName;

    @NotBlank(message = "File path is required")
    private String filePath;

    @NotNull(message = "File size is required")
    private Long fileSize;

    @NotNull(message = "Workspace id is required")
    private UUID workspaceId;
}
