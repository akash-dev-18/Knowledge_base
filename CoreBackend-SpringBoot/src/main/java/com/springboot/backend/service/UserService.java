package com.springboot.backend.service;

import com.springboot.backend.dto.request.UpdateUserRequest;
import com.springboot.backend.dto.response.UserResponse;
import com.springboot.backend.entity.User;
import com.springboot.backend.mapper.UserMapper;
import com.springboot.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;


    public UserResponse getById(UUID id){
        User user=userRepository.findById(id).orElseThrow(()-> new RuntimeException("User does not exist"));
        return userMapper.toResponse(user);
    }

    public List<UserResponse> getAllByCompany(UUID companyId){
        return userRepository.findByCompanyId(companyId).stream().map(userMapper::toResponse).toList();
    }

    @Transactional
    public UserResponse update(UUID id, UpdateUserRequest request) {
        User user = userRepository.findById(id).orElseThrow(()-> new RuntimeException("User not found"));

        if (request.getName() != null) {
            user.setName(request.getName());
        }
        if (request.getAvatarUrl() != null) {
            user.setAvatarUrl(request.getAvatarUrl());
        }

        return userMapper.toResponse(user);
    }

    @Transactional
    public void delete(UUID id) {
        User user = userRepository.findById(id).orElseThrow(()-> new RuntimeException("User not found"));
        userRepository.deleteById(id);
    }

    public User findByEmailOrThrow(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));
    }

    public User findByIdOrThrow(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found: " + id));
    }
}
