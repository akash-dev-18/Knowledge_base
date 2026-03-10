package com.springboot.backend.entity;


import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;


@Entity
@Table(name = "roles")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Role extends  BaseEntity{

    @Column(nullable = false)
    private String name;

    @OneToMany(mappedBy = "role",fetch = FetchType.LAZY)
    @Builder.Default
    private List<User> users= new ArrayList<>();

    @OneToMany(mappedBy = "role", fetch = FetchType.LAZY)
    @Builder.Default
    private List<WorkspaceUser> workspaceUsers = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;


}
