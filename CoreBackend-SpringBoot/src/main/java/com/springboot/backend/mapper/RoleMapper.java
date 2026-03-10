package com.springboot.backend.mapper;

import com.springboot.backend.dto.response.RoleResponse;
import com.springboot.backend.entity.Role;
import org.springframework.stereotype.Component;

@Component
public class RoleMapper {

    public RoleResponse toResponse(Role role) {
        return RoleResponse.builder()
                .id(role.getId())
                .name(role.getName())
                .build();
    }
}