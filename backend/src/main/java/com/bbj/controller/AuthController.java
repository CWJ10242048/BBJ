package com.bbj.controller;

import com.bbj.entity.User;
import com.bbj.service.UserService;
import com.bbj.utils.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class AuthController {

    @Autowired
    private UserService userService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginRequest) {
        String username = loginRequest.get("username");
        String password = loginRequest.get("password");
        String role = loginRequest.get("role");

        try {
            String upperRole = role.equals("teacher") ? "TEACHER" : "ADMIN";
            User user = userService.findByUsernameAndRole(username, upperRole);
            
            if (user == null) {
                Map<String, Object> response = new HashMap<>();
                response.put("code", 401);
                response.put("message", "用户名或角色错误");
                return ResponseEntity.ok(response);
            }

            if (!password.equals(user.getPassword())) {
                Map<String, Object> response = new HashMap<>();
                response.put("code", 401);
                response.put("message", "密码错误");
                return ResponseEntity.ok(response);
            }

            String token = JwtUtil.generateToken(user);

            Map<String, Object> response = new HashMap<>();
            response.put("code", 200);
            response.put("message", "登录成功");
            response.put("token", token);
            response.put("data", user);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> response = new HashMap<>();
            response.put("code", 500);
            response.put("message", "服务器错误");
            return ResponseEntity.ok(response);
        }
    }
} 