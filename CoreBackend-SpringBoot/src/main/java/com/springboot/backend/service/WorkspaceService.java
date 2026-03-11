package com.springboot.backend.service;

import com.springboot.backend.dto.request.AddWorkspaceMemberRequest;
import com.springboot.backend.dto.request.CreateWorkspaceRequest;
import com.springboot.backend.dto.request.UpdateWorkspaceRequest;
import com.springboot.backend.dto.response.WorkspaceUserResponse;
import com.springboot.backend.dto.response.WorkspaceResponse;
import com.springboot.backend.entity.*;
import com.springboot.backend.mapper.WorkspaceUserMapper;
import com.springboot.backend.mapper.WorkspaceMapper;
import com.springboot.backend.repository.CompanyRepository;
import com.springboot.backend.repository.UserRepository;
import com.springboot.backend.repository.WorkspaceRepository;
import com.springboot.backend.repository.WorkspaceUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class WorkspaceService {

    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceUserRepository workspaceUserRepository;
    private final WorkspaceMapper workspaceMapper;
    private final WorkspaceUserMapper workspaceUserMapper;
    private final UserRepository userRepository;
    private final RoleService roleService;
    private final CompanyService companyService;
    private final CompanyRepository companyRepository;

    @Transactional
    public WorkspaceResponse create(CreateWorkspaceRequest request, UUID companyId, UUID userId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Company not found: " + companyId));

        if (workspaceRepository.existsByNameAndCompanyId(request.getName(), companyId)) {
            throw new RuntimeException("Workspace already exists: " + request.getName());
        }

        Workspace workspace = workspaceRepository.save(
                Workspace.builder()
                        .name(request.getName())
                        .description(request.getDescription())
                        .company(company)
                        .build()
        );

        User creator = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        Role ownerRole = roleService.findByNameAndCompanyOrThrow("OWNER", companyId);

        workspaceUserRepository.save(
                WorkspaceUser.builder()
                        .workspace(workspace)
                        .user(creator)
                        .role(ownerRole)
                        .build()
        );

        return workspaceMapper.toResponse(workspace);
    }

    public List<WorkspaceResponse> getAllByCompany(UUID companyId) {
        return workspaceRepository.findByCompanyId(companyId)
                .stream()
                .map(workspaceMapper::toResponse)
                .toList();
    }

    public WorkspaceResponse getById(UUID id) {
        Workspace workspace = workspaceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Workspace not found: " + id));
        return workspaceMapper.toResponse(workspace);
    }

    @Transactional
    public WorkspaceResponse update(UUID id, UpdateWorkspaceRequest request) {
        Workspace workspace = workspaceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Workspace not found: " + id));

        if (request.getName() != null) {
            workspace.setName(request.getName());
        }
        if (request.getDescription() != null) {
            workspace.setDescription(request.getDescription());
        }

        return workspaceMapper.toResponse(workspace);
    }

    @Transactional
    public void delete(UUID id) {
        Workspace workspace = workspaceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Workspace not found: " + id));
        workspaceRepository.delete(workspace);
    }

    @Transactional
    public WorkspaceUserResponse addMember(UUID workspaceId, AddWorkspaceMemberRequest request, UUID companyId) {
        if (workspaceUserRepository.existsByUserIdAndWorkspaceId(request.getUserId(), workspaceId)) {
            throw new RuntimeException("User already a member");
        }

        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new RuntimeException("Workspace not found: " + workspaceId));

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found: " + request.getUserId()));

        Role role = roleService.findByNameAndCompanyOrThrow("MEMBER", companyId);

        WorkspaceUser member = workspaceUserRepository.save(
                WorkspaceUser.builder()
                        .workspace(workspace)
                        .user(user)
                        .role(role)
                        .build()
        );

        return workspaceUserMapper.toResponse(member);
    }

    @Transactional
    public void removeMember(UUID workspaceId, UUID userId) {
        WorkspaceUser member = workspaceUserRepository
                .findByUserIdAndWorkspaceId(userId, workspaceId)
                .orElseThrow(() -> new RuntimeException("Member not found"));
        workspaceUserRepository.delete(member);
    }

    public List<WorkspaceUserResponse> getMembers(UUID workspaceId) {
        return workspaceUserRepository.findByWorkspaceId(workspaceId)
                .stream()
                .map(workspaceUserMapper::toResponse)
                .toList();
    }

    public Workspace findByIdOrThrow(UUID id) {
        return workspaceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Workspace not found: " + id));
    }
}