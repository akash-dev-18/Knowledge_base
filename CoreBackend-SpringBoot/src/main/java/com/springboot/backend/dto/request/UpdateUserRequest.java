package com.springboot.backend.dto.request;

import lombok.Getter;
import lombok.Setter;


@Getter
@Setter
public class UpdateUserRequest {
    private String name;
    private String avatarUrl;

}
