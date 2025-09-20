package com.example.washgo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.washgo.enums.emailStatus;
import com.example.washgo.model.UserEmail;

@Repository
public interface UserEmailRepository extends JpaRepository<UserEmail, Long> {

    boolean existsByUserEmailAndEmailStatus(String userEmail, emailStatus emailStatus);

	UserEmail findByUserMail(String email);
	
}
