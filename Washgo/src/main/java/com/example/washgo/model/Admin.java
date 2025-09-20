package com.example.washgo.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name="admins")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Admin {

    @Id
    private Long userId;

    private Integer roleLevel;

    // Constructors, getters & setters...
}