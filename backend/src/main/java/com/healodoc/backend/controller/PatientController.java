package com.healodoc.backend.controller;

import com.healodoc.backend.dto.PatientRequest;
import com.healodoc.backend.dto.PatientResponse;
import com.healodoc.backend.service.PatientService;
import com.healodoc.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.MediaTypeFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@CrossOrigin
@RequestMapping("/patient")
@RequiredArgsConstructor
public class PatientController {
    final private UserService userService;
    final private PatientService patientService;

    @PostMapping(value = "/registration", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> registerPatient(@ModelAttribute PatientRequest request) throws IOException {
        userService.registerPatient(request);
        return ResponseEntity.ok("Registration Successful.");
    }

    @GetMapping("/details/{id}")
    public ResponseEntity<PatientResponse> getPatientDetails(@PathVariable Long id){
        return ResponseEntity.ok(patientService.getPatientDetails(id));
    }

    @GetMapping("/{id}/photo")
    public ResponseEntity<Resource> getPatientPhoto(@PathVariable Long id) throws IOException{
        Resource photo = patientService.getPatientPhoto(id);

        MediaType contentType = MediaTypeFactory
                .getMediaType(photo)
                .orElse(MediaType.APPLICATION_OCTET_STREAM);

        return ResponseEntity.ok()
                .contentType(contentType)
                .body(photo);
    }

    @PutMapping("/details/{id}")
    public ResponseEntity<String> updatePatientDetails(@PathVariable Long id, @RequestBody PatientRequest request){
        patientService.updatePatientDetails(id, request);
        return ResponseEntity.ok("Profile Updated Successfully.");
    }
}
