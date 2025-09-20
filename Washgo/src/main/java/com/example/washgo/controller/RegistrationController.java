package com.example.washgo.controller;

import com.example.washgo.dtos.UserCreateDTO;
import com.example.washgo.dtos.UserReadDTO;
import com.example.washgo.dtos.UserUpdateDTO; // Import Update DTO
import com.example.washgo.service.UserRegistrationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
// Import security annotations if using them
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication; // To potentially get current user details
import org.springframework.web.bind.annotation.*;

import java.util.List; // Import List

@RestController
@RequestMapping("/register") // Consider changing to "/api/users"
public class RegistrationController {

    private final UserRegistrationService registrationService;

    public RegistrationController(UserRegistrationService registrationService) {
        this.registrationService = registrationService;
    }

    // --- CREATE (POST) ---
    /**
     * Registers/Creates a new user.
     * Publicly accessible (usually).
     * @param createDTO DTO containing user details.
     * @return ResponseEntity containing the UserReadDTO of the created user and HTTP status 201.
     */
    @PostMapping
    public ResponseEntity<UserReadDTO> registerNewUser(@Valid @RequestBody UserCreateDTO createDTO) {
    	UserReadDTO createdUser = registrationService.registerUser(createDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
    }

    // --- READ All (GET) ---
    /**
     * Retrieves a list of all users.
     * Requires ADMIN role (example authorization).
     * @return ResponseEntity containing a list of UserReadDTOs.
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')") // Example: Only admins can list all users
    public ResponseEntity<List<UserReadDTO>> getAllUsers() {
        List<UserReadDTO> users = registrationService.findAllUsers();
        return ResponseEntity.ok(users);
    }

    // --- READ One (GET by ID) ---
    /**
     * Retrieves a specific user by their ID.
     * Requires ADMIN role or the user fetching their own profile (example authorization).
     * @param id The ID of the user to retrieve.
     * @param authentication The current authentication principal.
     * @return ResponseEntity containing the UserReadDTO.
     */
    @GetMapping("/{id}")
    // Example: Admin can get any, users can get their own. Needs careful implementation.
    // Assumes Authentication principal's name is the username.
    @PreAuthorize("hasRole('ADMIN') or (isAuthenticated() and @userRegistrationService.findUserEntityById(#id).username == #authentication.name)")
    public ResponseEntity<UserReadDTO> getUserById(@PathVariable Long id, Authentication authentication) {
        UserReadDTO user = registrationService.findUserDTOById(id);
        return ResponseEntity.ok(user);
    }

    // --- UPDATE (PUT) ---
    /**
     * Updates an existing user by their ID.
     * Requires ADMIN role or the user updating their own profile (example authorization).
     * @param id The ID of the user to update.
     * @param updateDTO DTO containing the fields to update.
     * @param authentication The current authentication principal.
     * @return ResponseEntity containing the updated UserReadDTO.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or (isAuthenticated() and @userRegistrationService.findUserEntityById(#id).username == #authentication.name)")
    public ResponseEntity<UserReadDTO> updateUser(@PathVariable Long id,
                                                  @Valid @RequestBody UserUpdateDTO updateDTO,
                                                  Authentication authentication) {
        UserReadDTO updatedUser = registrationService.updateUser(id, updateDTO);
        return ResponseEntity.ok(updatedUser);
    }

    // --- DELETE (DELETE by ID) ---
    /**
     * Deletes a user by their ID.
     * Requires ADMIN role (example authorization).
     * @param id The ID of the user to delete.
     * @return ResponseEntity with status 204 No Content.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')") // Example: Only admins can delete users
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        registrationService.deleteUser(id);
        return ResponseEntity.noContent().build(); // Return 204 No Content
    }
}