package com.bbj.controller;

import com.bbj.dto.PasswordUpdateRequest;
import com.bbj.dto.UserDTO;
import com.bbj.dto.UserUpdateRequest;
import com.bbj.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "http://localhost:8080")
public class UserController {

    private final UserService userService;
    
    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }
    
    @GetMapping("/info")
    public ResponseEntity<UserDTO> getUserInfo() {
        // TODO: 从安全上下文中获取当前用户ID，这里暂时硬编码
        Long userId = 1L;
        UserDTO user = userService.getUserById(userId);
        return ResponseEntity.ok(user);
    }
    
    @PutMapping("/update")
    public ResponseEntity<UserDTO> updateUser(@RequestBody UserUpdateRequest request) {
        // TODO: 从安全上下文中获取当前用户ID，这里暂时硬编码
        Long userId = 1L;
        UserDTO updatedUser = userService.updateUser(userId, request);
        return ResponseEntity.ok(updatedUser);
    }
    
    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody PasswordUpdateRequest request) {
        // TODO: 从安全上下文中获取当前用户ID，这里暂时硬编码
        Long userId = 1L;
        boolean success = userService.changePassword(userId, request);
        
        Map<String, Object> response = new HashMap<>();
        if (success) {
            response.put("success", true);
            response.put("message", "密码修改成功");
            return ResponseEntity.ok(response);
        } else {
            response.put("success", false);
            response.put("message", "原密码不正确");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }
    
    @PostMapping("/upload-avatar")
    public ResponseEntity<?> uploadAvatar(@RequestParam("file") MultipartFile file) {
        // TODO: 从安全上下文中获取当前用户ID，这里暂时硬编码
        Long userId = 1L;
        
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("请选择要上传的文件");
        }
        
        try {
            // 确保目录存在
            String uploadDir = "./uploads/avatars/";
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            
            // 生成唯一文件名
            String originalFilename = file.getOriginalFilename();
            String fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
            String newFilename = UUID.randomUUID().toString() + fileExtension;
            
            // 保存文件
            Path filePath = uploadPath.resolve(newFilename);
            Files.copy(file.getInputStream(), filePath);
            
            // 更新用户头像URL
            String avatarUrl = "/uploads/avatars/" + newFilename;
            userService.updateAvatar(userId, avatarUrl);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("avatarUrl", avatarUrl);
            return ResponseEntity.ok(response);
            
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("上传头像失败: " + e.getMessage());
        }
    }
} 