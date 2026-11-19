package com.healodoc.backend.dto;

import com.healodoc.backend.model.Gender;
import com.healodoc.backend.model.Patient;
import lombok.Data;

import java.time.LocalDate;

@Data
public class PatientResponse {

    private String fullname;
    private String username;
    private String email;
    private LocalDate dateOfBirth;
    private String bloodGroup;
    private Gender gender;
    private LocalDate regDate;
    private String photoUrl;

    public static PatientResponse fromPatient(Patient patient){
        PatientResponse response = new PatientResponse();
        response.fullname = patient.getFullname();
        response.username = patient.getUser().getUsername();
        response.email = patient.getEmail();
        response.dateOfBirth = patient.getDateOfBirth();
        response.gender = patient.getGender();
        response.regDate = patient.getRegDate();
        return response;
    }
}
