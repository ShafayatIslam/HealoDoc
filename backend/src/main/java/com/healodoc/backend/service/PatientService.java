package com.healodoc.backend.service;

import com.healodoc.backend.dto.PatientResponse;
import com.healodoc.backend.model.Patient;
import com.healodoc.backend.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;

@Service
@RequiredArgsConstructor
public class PatientService {
    final private PatientRepository patientRepo;
    final private FileStorageService fileStorageService;

    public PatientResponse getPatientDetails(Long id){
        Patient p = patientRepo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found!"));

        String photoUrl = null;
        if(p.getPhoto() != null){
            photoUrl = "/" + p.getId() + "/photo";
        }

        PatientResponse response = PatientResponse.fromPatient(p);
        response.setPhotoUrl(photoUrl);
        return response;
    }

    public Resource getPatientPhoto(Long id) throws IOException {
        Patient patient = patientRepo.findById(id).orElseThrow(() -> new IllegalArgumentException("Student not found with id " + id));
        if(patient.getPhoto() == null)
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Photo not found!");

        return fileStorageService.loadPhoto("patient-photos", patient.getPhoto());
    }

}
