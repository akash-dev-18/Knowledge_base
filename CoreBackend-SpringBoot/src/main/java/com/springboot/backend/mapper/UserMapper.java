package com.springboot.backend.mapper;

import com.springboot.backend.dto.response.UserResponse;
import com.springboot.backend.entity.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {
    public UserResponse toResponse(User user){
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .status(user.getUserStatus().name())
                .roleName(user.getRole()!=null?user.getRole().getName():null)
                .companyName(user.getCompany() != null ? user.getCompany().getName() : null)
                .build();
    }
}

