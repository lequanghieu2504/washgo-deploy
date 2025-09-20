package com.example.washgo.dtos;


import lombok.Data;

@Data
public class AdminDTO {
    private Long id;
    private String username;
    private String email;
    private String role;
}
