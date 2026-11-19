package com.healodoc.backend.controller;

import com.healodoc.backend.dto.PatientRequest;
import com.healodoc.backend.repository.PatientRepository;
import com.healodoc.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin
@RequestMapping("/patient")
@RequiredArgsConstructor
public class PatientController {
    final private UserService userService;

    @PostMapping("/registration")
    public ResponseEntity<String> registerPatient(@RequestBody PatientRequest request){
        userService.registerPatient(request);
        return ResponseEntity.ok("Registration Successful.");
    }
}
