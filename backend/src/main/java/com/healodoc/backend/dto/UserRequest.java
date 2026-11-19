package com.healodoc.backend.dto;

import com.healodoc.backend.model.Role;
import com.healodoc.backend.model.User;
import lombok.Data;

@Data
public class UserRequest {
    private String username;
    private String password;
    private Role role;

    public static User toUser(UserRequest request){
        User u = new User(request.username, request.password, request.role);
        return u;
    }
}
