package com.bbj.service.impl;

import com.bbj.dto.PasswordUpdateRequest;
import com.bbj.dto.UserDTO;
import com.bbj.dto.UserUpdateRequest;
import com.bbj.entity.User;
import com.bbj.repository.UserRepository;
import com.bbj.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.persistence.EntityNotFoundException;

@Service
public class UserServiceImpl implements UserService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    @Autowired
    public UserServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }
    
    @Override
    public UserDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + id));
        return convertToDTO(user);
    }
    
    @Override
    public UserDTO getUserByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("User not found with username: " + username));
        return convertToDTO(user);
    }
    
    @Override
    @Transactional
    public UserDTO updateUser(Long userId, UserUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));
        
        // 更新用户信息
        if (request.getNickname() != null) {
            user.setNickname(request.getNickname());
        }
        if (request.getAvatarUrl() != null) {
            user.setAvatarUrl(request.getAvatarUrl());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        if (request.getEmail() != null) {
            user.setEmail(request.getEmail());
        }
        if (request.getSchool() != null) {
            user.setSchool(request.getSchool());
        }
        if (request.getSubject() != null) {
            user.setSubject(request.getSubject());
        }
        
        User updatedUser = userRepository.save(user);
        return convertToDTO(updatedUser);
    }
    
    @Override
    @Transactional
    public boolean changePassword(Long userId, PasswordUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));
        
        // 验证旧密码
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            return false;
        }
        
        // 更新密码
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        return true;
    }
    
    @Override
    @Transactional
    public void updateAvatar(Long userId, String avatarUrl) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));
        user.setAvatarUrl(avatarUrl);
        userRepository.save(user);
    }
    
    // 转换实体为DTO
    private UserDTO convertToDTO(User user) {
        return new UserDTO(
                user.getId(),
                user.getUsername(),
                user.getNickname(),
                user.getAvatarUrl(),
                user.getPhone(),
                user.getEmail(),
                user.getSchool(),
                user.getSubject(),
                user.getRole()
        );
    }
} 