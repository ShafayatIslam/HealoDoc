package com.healodoc.backend.controller;

import com.healodoc.backend.dto.UserRequest;
import com.healodoc.backend.dto.UserResponse;
import com.healodoc.backend.repository.UserRepository;
import com.healodoc.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin
@RequestMapping("/user")
@RequiredArgsConstructor
public class UserController {
    final private UserService userService;

    @PostMapping("/login")
    public ResponseEntity<UserResponse> login(@RequestBody UserRequest request){
        return ResponseEntity.ok(userService.login(request));
    }
}
