package com.springboot.backend.mapper;

import com.springboot.backend.dto.response.WorkspaceUserResponse;
import com.springboot.backend.entity.WorkspaceUser;
import org.springframework.stereotype.Component;

@Component
public class WorkspaceUserMapper {

    public WorkspaceUserResponse toResponse(WorkspaceUser workspaceUser){
        return WorkspaceUserResponse.builder()
                .userId((workspaceUser.getUser().getId()))
                .userEmail(workspaceUser.getUser().getEmail())
                .userName(workspaceUser.getUser().getName())
                .roleName(workspaceUser.getRole()!=null?workspaceUser.getRole().getName():null)
                .joinedAt(workspaceUser.getJoinedAt())
                .build();


    }
}
