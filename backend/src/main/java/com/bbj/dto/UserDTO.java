package com.bbj.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    private Long id;
    private String username;
    private String nickname;
    private String avatarUrl;
    private String phone;
    private String email;
    private String school;
    private String subject;
    private String role;
} 