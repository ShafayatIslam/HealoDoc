package com.healodoc.backend.service;

import com.healodoc.backend.dto.PatientRequest;
import com.healodoc.backend.dto.UserRequest;
import com.healodoc.backend.model.Patient;
import com.healodoc.backend.model.User;
import com.healodoc.backend.repository.PatientRepository;
import com.healodoc.backend.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class UserService {

    final private UserRepository userRepo;
    final private PatientRepository patientRepo;
    final private PasswordEncoder passwordEncoder;

    @Transactional
    public void registerPatient(PatientRequest request){
        if(userRepo.existsByUsername(request.getUsername()))
            throw new ResponseStatusException(HttpStatus.CONFLICT, request.getUsername() + " already exist!");
        if(patientRepo.existsByEmail(request.getEmail()))
            throw new ResponseStatusException(HttpStatus.CONFLICT, request.getEmail() + " already exists!");

        User user = PatientRequest.toUser(request);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        User savedUser = userRepo.save(user);

        Patient patient = PatientRequest.toPatient(request);
        patient.setUser(savedUser);
        patient.setRegDate(LocalDate.now());
        patientRepo.save(patient);
    }

}
