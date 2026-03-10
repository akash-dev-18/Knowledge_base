package com.springboot.backend.mapper;

import com.springboot.backend.dto.response.WorkspaceResponse;
import com.springboot.backend.entity.Workspace;
import org.springframework.stereotype.Component;

@Component
public class WorkspaceMapper {

    public WorkspaceResponse toResponse(Workspace workspace) {
        return WorkspaceResponse.builder()
                .id(workspace.getId())
                .name(workspace.getName())
                .description(workspace.getDescription())
                .companyName(workspace.getCompany() != null ? workspace.getCompany().getName() : null)
                .memberCount(workspace.getWorkspaceUsers() != null ? workspace.getWorkspaceUsers().size() : 0)
                .build();
    }
}