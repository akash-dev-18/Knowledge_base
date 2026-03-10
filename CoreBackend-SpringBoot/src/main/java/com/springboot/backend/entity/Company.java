package com.springboot.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name="company")
@Getter @Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Company extends BaseEntity {

    @Column(nullable = false,length = 100)
    private String name;

    @Column(nullable = false)
    private String description;

    @Column(nullable =true)
    private String logoUrl;

    @OneToMany(mappedBy = "company",cascade = CascadeType.ALL,orphanRemoval = true,fetch = FetchType.LAZY)
    @Builder.Default
    private List<Role> roles = new ArrayList<>();

    @OneToMany(mappedBy = "company",cascade = CascadeType.ALL,fetch = FetchType.LAZY,orphanRemoval = true)
    @Builder.Default
    private List<Workspace> workspaces = new ArrayList<>();

    @OneToMany(mappedBy = "company",cascade = CascadeType.ALL,fetch = FetchType.LAZY,orphanRemoval = true)
    @Builder.Default
    private List<User> users = new ArrayList<>();}
