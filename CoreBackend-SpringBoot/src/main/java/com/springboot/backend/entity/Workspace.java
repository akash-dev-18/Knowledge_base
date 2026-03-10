package com.springboot.backend.entity;


import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name="workspaces")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Workspace extends BaseEntity{

    @Column(nullable = false)
    private String name;

    @Column(nullable=false)
    private String description;

    @OneToMany(mappedBy = "workspace",cascade = CascadeType.ALL,orphanRemoval = true,fetch = FetchType.LAZY)
    @Builder.Default
    private List<Document> documents = new ArrayList<>();

    @OneToMany(mappedBy = "workspace",cascade = CascadeType.ALL,orphanRemoval = true,fetch = FetchType.LAZY)
    @Builder.Default
    private List<WorkspaceUser> workspaceUsers= new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id",nullable = false)
    private Company company;
}
