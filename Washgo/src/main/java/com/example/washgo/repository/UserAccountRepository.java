package com.example.washgo.repository;

import com.example.washgo.model.UserAccount;
import com.example.washgo.model.UserInformation;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface UserAccountRepository extends JpaRepository<UserAccount, Long> {
    Optional<UserAccount> findByUsername(String username);
    Optional<UserAccount> findByGoogleId(String googleId);

}

