package com.example.washgo.dtos;

import lombok.Data;

@Data
public class ClientDTO {
    private Long id;
    private String username;
    private String email;
    private String role;
}
