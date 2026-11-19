package com.healodoc.backend.service;

import com.healodoc.backend.dto.PatientResponse;
import com.healodoc.backend.model.Patient;
import com.healodoc.backend.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class PatientService {
    final private PatientRepository patientRepo;

    public PatientResponse getPatientDetails(Long id){
        Patient p = patientRepo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found!"));
        return PatientResponse.fromPatient(p);
    }

    
}
