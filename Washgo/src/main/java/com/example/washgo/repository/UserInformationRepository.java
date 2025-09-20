package com.example.washgo.repository;

import com.example.washgo.model.UserAccount;
import com.example.washgo.model.UserInformation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserInformationRepository extends JpaRepository<UserInformation, Long> {
	@Query("SELECT u FROM UserInformation u WHERE u.account.username = :username")
	Optional<UserInformation> findByAccountUsername(@Param("username") String username);
    boolean existsByPhoneNumber(String phoneNumber);
    @Query("SELECT DISTINCT u FROM UserInformation u WHERE u.phoneNumber = :phoneNumber")
    Optional<UserInformation> findByPhoneNumber(@Param("phoneNumber") String phoneNumber);
    Optional<UserInformation> findByEmail(String email);
    boolean existsByEmail(String email);
    long countByAvatar_Id(UUID mediaId);
}