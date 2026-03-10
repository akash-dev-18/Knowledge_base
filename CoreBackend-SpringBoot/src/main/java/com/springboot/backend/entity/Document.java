package com.springboot.backend.entity;

import com.springboot.backend.enums.DocumentStatus;
import jakarta.persistence.*;
import lombok.*;


@Entity
@Table(name = "documents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Document extends BaseEntity{

    @Column(nullable = false)
    private String fileName;

    @Column(nullable = false,unique = true,columnDefinition = "TEXT")
    private String filePath;

    @Column(nullable = false)
    private long fileSize;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private DocumentStatus status=DocumentStatus.UPLOADING;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workspace_id",nullable = false)
    private Workspace workspace;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id",nullable = false)
    private User user;

}
