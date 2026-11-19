package com.healodoc.backend.controller;

import com.healodoc.backend.dto.PatientRequest;
import com.healodoc.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@CrossOrigin
@RequestMapping("/patient")
@RequiredArgsConstructor
public class PatientController {
    final private UserService userService;

    @PostMapping(value = "/registration", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> registerPatient(@ModelAttribute PatientRequest request) throws IOException {
        userService.registerPatient(request);
        return ResponseEntity.ok("Registration Successful.");
    }
}
