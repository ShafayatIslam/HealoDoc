package com.healodoc.backend.dto;

import com.healodoc.backend.model.Gender;
import com.healodoc.backend.model.Patient;
import com.healodoc.backend.model.Role;
import com.healodoc.backend.model.User;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;

@Data
public class PatientRequest {
    private String username;
    private String password;
    private Role role;

    private String fullname;
    private LocalDate DateOfBirth;
    private String bloodGroup;
    private Gender gender;
    private String email;
    private MultipartFile photo;

    public static User toUser(PatientRequest request){
        return new User(request.username, request.password, request.role);
    }

    public static Patient toPatient(PatientRequest request){
        Patient p = new Patient();
        p.setFullname(request.fullname);
        p.setDateOfBirth(request.DateOfBirth);
        p.setBloodGroup(request.bloodGroup);
        p.setGender(request.gender);
        p.setEmail(request.email);
        return p;
    }
}
