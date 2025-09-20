package com.example.washgo.dtos;

import lombok.Data;

@Data
public class ClientRegistrationRequest {
    private String username;
    private String email;
    private String password; // In practice, pass raw password and encode it here.
}
