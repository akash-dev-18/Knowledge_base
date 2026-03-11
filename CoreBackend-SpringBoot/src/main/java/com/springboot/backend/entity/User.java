package com.springboot.backend.entity;

import com.springboot.backend.enums.UserStatus;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@Table(name="users")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User extends BaseEntity {
    @Column(unique = true,nullable = false)
    private String email;

    @Column(nullable = false)
    private String name;

    @Column( nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default //use where default value exists
    private UserStatus userStatus= UserStatus.ACTIVE;

    @Column(name="avatar_url",columnDefinition = "TEXT")
    private String avatarUrl;


//relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name="company_id",
            nullable = false
    )
    private Company company;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="role_id",nullable = false)
    private Role role;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<WorkspaceUser> workspaceUsers = new ArrayList<>();

    @OneToMany(mappedBy = "user",fetch = FetchType.LAZY)
    @Builder.Default
    private List<Document> documents=new ArrayList<>();
}
