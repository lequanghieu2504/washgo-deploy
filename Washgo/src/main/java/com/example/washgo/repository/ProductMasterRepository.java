// src/main/java/com/example/washgo/repository/ProductMasterRepository.java
package com.example.washgo.repository;

import com.example.washgo.model.ProductMaster;
import com.example.washgo.model.UserInformation; // Import UserInformation
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query; // Import Query

import java.util.List; // Import List

public interface ProductMasterRepository extends JpaRepository<ProductMaster, Long> {}