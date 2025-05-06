package com.bbj.service;

import com.bbj.dto.PasswordUpdateRequest;
import com.bbj.dto.UserDTO;
import com.bbj.dto.UserUpdateRequest;
import com.bbj.entity.User;

public interface UserService {
    
    UserDTO getUserById(Long id);
    
    UserDTO getUserByUsername(String username);
    
    UserDTO updateUser(Long userId, UserUpdateRequest request);
    
    boolean changePassword(Long userId, PasswordUpdateRequest request);
    
    void updateAvatar(Long userId, String avatarUrl);

    User findByUsernameAndRole(String username, String role);
} 