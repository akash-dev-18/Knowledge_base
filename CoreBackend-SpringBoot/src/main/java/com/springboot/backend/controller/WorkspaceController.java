package com.springboot.backend.controller;

import com.springboot.backend.dto.request.AddWorkspaceMemberRequest;
import com.springboot.backend.dto.request.CreateWorkspaceRequest;
import com.springboot.backend.dto.request.UpdateWorkspaceRequest;
import com.springboot.backend.dto.response.WorkspaceUserResponse;
import com.springboot.backend.dto.response.WorkspaceResponse;
import com.springboot.backend.entity.User;
import com.springboot.backend.service.WorkspaceService;
import com.springboot.backend.util.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/workspaces")
@RequiredArgsConstructor
public class WorkspaceController {

    private final WorkspaceService workspaceService;
    private final SecurityUtils securityUtils;

    @PostMapping
    public ResponseEntity<WorkspaceResponse> create(
            @Valid @RequestBody CreateWorkspaceRequest request
    ) {
        User currentUser = securityUtils.getCurrentUser();
        return ResponseEntity.status(201).body(
                workspaceService.create(
                        request,
                        currentUser.getCompany().getId(),
                        currentUser.getId()
                )
        );
    }

    @GetMapping
    public ResponseEntity<List<WorkspaceResponse>> getAll() {
        User currentUser = securityUtils.getCurrentUser();
        return ResponseEntity.ok(
                workspaceService.getAllByCompany(currentUser.getCompany().getId())
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<WorkspaceResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(workspaceService.getById(id));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<WorkspaceResponse> update(
            @PathVariable UUID id,
            @RequestBody UpdateWorkspaceRequest request
    ) {
        return ResponseEntity.ok(workspaceService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        workspaceService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/members")
    public ResponseEntity<WorkspaceUserResponse> addMember(
            @PathVariable UUID id,
            @Valid @RequestBody AddWorkspaceMemberRequest request
    ) {
        User currentUser = securityUtils.getCurrentUser();
        return ResponseEntity.status(201).body(
                workspaceService.addMember(id, request, currentUser.getCompany().getId())
        );
    }

    @DeleteMapping("/{id}/members/{userId}")
    public ResponseEntity<Void> removeMember(
            @PathVariable UUID id,
            @PathVariable UUID userId
    ) {
        workspaceService.removeMember(id, userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/members")
    public ResponseEntity<List<WorkspaceUserResponse>> getMembers(@PathVariable UUID id) {
        return ResponseEntity.ok(workspaceService.getMembers(id));
    }

    @PatchMapping("/{id}/members/{userId}/role")
    public ResponseEntity<WorkspaceUserResponse> updateMemberRole(
            @PathVariable UUID id,
            @PathVariable UUID userId,
            @RequestParam String roleName
    ) {
        User currentUser = securityUtils.getCurrentUser();
        return ResponseEntity.ok(
                workspaceService.updateMemberRole(
                        id, userId, roleName, currentUser.getCompany().getId()
                )
        );
    }
}