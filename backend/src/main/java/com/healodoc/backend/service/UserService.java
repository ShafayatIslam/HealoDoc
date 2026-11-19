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
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class UserService {

    final private UserRepository userRepo;
    final private PatientRepository patientRepo;

    @Transactional
    public void registerPatient(PatientRequest request){
        if(userRepo.existsByUsername(request.getUsername()))
            throw new ResponseStatusException(HttpStatus.CONFLICT, request.getUsername() + " already exist!");
        if(patientRepo.existsByEmail(request.getEmail()))
            throw new ResponseStatusException(HttpStatus.CONFLICT, request.getEmail() + " already exists!");

        User user = PatientRequest.toUser(request);
        User savedUser = userRepo.save(user);

        Patient patient = PatientRequest.toPatient(request);
        patient.setUser(savedUser);
        patientRepo.save(patient);
    }

}
