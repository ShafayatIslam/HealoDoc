package com.healodoc.backend.dto;

import com.healodoc.backend.model.Role;
import com.healodoc.backend.model.User;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String username;
    private Role role;

    public static UserResponse fromUser(User u){
        return new UserResponse(u.getId(), u.getUsername(), u.getRole());
    }
}
