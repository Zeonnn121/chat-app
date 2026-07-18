package com.substring.chat.controllers;

import com.substring.chat.entities.User;
import com.substring.chat.playload.AuthRequest;
import com.substring.chat.repositories.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final UserRepository userRepo;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public AuthController(UserRepository userRepo) {
        this.userRepo = userRepo;
    }

    // Signup
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody AuthRequest request) {
        if (request.getUsername() == null || request.getUsername().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Username is required");
        }
        if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Password is required");
        }

        String username = request.getUsername().trim();
        if (userRepo.findByUsername(username) != null) {
            return ResponseEntity.badRequest().body("User already exists");
        }

        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        userRepo.save(user);

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("username", username));
    }

    // Login
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        if (request.getUsername() == null || request.getPassword() == null) {
            return ResponseEntity.badRequest().body("Username and password are required");
        }

        User user = userRepo.findByUsername(request.getUsername().trim());
        if (user == null || !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return ResponseEntity.badRequest().body("Invalid username or password");
        }

        return ResponseEntity.ok(Map.of("username", user.getUsername()));
    }
}
