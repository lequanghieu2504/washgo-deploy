package com.example.washgo.service;

import com.example.washgo.model.UserAccount;
import com.example.washgo.model.UserInformation;
import com.example.washgo.model.VerificationToken;
import com.example.washgo.dtos.UserCreateDTO;
import com.example.washgo.enums.UserRole;
import com.example.washgo.enums.emailStatus;
import com.example.washgo.repository.UserAccountRepository;
import com.example.washgo.repository.UserInformationRepository;
import com.example.washgo.repository.VerificationTokenRepository;
import com.example.washgo.security.JwtService;
import com.example.washgo.security.JwtUtil;

import org.springframework.security.core.userdetails.User;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.security.crypto.password.PasswordEncoder; // Import PasswordEncoder
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // Import Transactional

import java.security.PublicKey;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {

    private final UserInformationRepository userInformationRepository;
    private final PasswordEncoder passwordEncoder; // Inject PasswordEncoder
    private final UserAccountRepository userAccountRepository;
    private final JwtService jwtService;
    private final UserRegistrationService userRegistrationService;


    // Update constructor to inject PasswordEncoder
    public AuthService(UserRegistrationService userRegistrationService,JwtService jwtService,UserAccountRepository userAccountRepository,UserInformationRepository userInformationRepository, PasswordEncoder passwordEncoder,MailService mailService) {
        this.userInformationRepository = userInformationRepository;
        this.passwordEncoder = passwordEncoder;
        this.userAccountRepository = userAccountRepository;
        this.jwtService = jwtService;
        this.userRegistrationService = userRegistrationService;
    }

    @Transactional // Add transactional annotation
    public UserAccount register(String username, String email, String rawPassword, UserRole role) {
        // Check for existing username
        if (userAccountRepository.findByUsername(username).isPresent()) {
            throw new IllegalArgumentException("Username already exists: " + username);
        }
        // Check for existing email
        if (userInformationRepository.findByEmail(email).isPresent()) {
            throw new IllegalArgumentException("Email already exists: " + email);
        }

        // Ensure rawPassword is not null or empty before hashing
        if (rawPassword == null || rawPassword.isBlank()) {
            // Allow null/blank password only if it's a Google registration (handled differently)
            if (role != UserRole.CLIENT || !username.startsWith("google_")) { // Basic check, adjust as needed
                throw new IllegalArgumentException("Password cannot be empty for standard registration.");
            }
            // For Google registration, we might store a placeholder or null if password login is disabled
            // However, the current logic uses "N/A" in AuthController, let's stick to that for now.
            // If "N/A" is passed, we need to handle it. Let's assume a real password or placeholder hash is expected.
            // We'll rely on the calling code (AuthController) to handle the "N/A" case appropriately before calling register.
            // *Correction*: Best practice is to hash even a placeholder password, or handle null passwordHash explicitly.
            // Let's enforce non-empty password here. Google registration logic in AuthController should adapt.
            throw new IllegalArgumentException("Password cannot be empty.");
        }


        String hashed = passwordEncoder.encode(rawPassword); // Use injected encoder
        UserInformation user = new UserInformation();
        user.setRole(role);
        UserAccount newUserAccount = new UserAccount();
        newUserAccount.setUsername(username);
        newUserAccount.setPasswordHash(hashed);
        newUserAccount.setUser(userInformationRepository.save(user));
                // createdAt and updatedAt are handled by @PrePersist
        return  userAccountRepository.save(newUserAccount);
    }

    public UserAccount loginWithPassword(String username, String rawPassword) {
        // Tìm kiếm UserAccount bằng username và trả về Optional
        Optional<UserAccount> optionalUserAccount = userAccountRepository.findByUsername(username);

        // Kiểm tra nếu Optional chứa giá trị và mật khẩu hợp lệ
        return optionalUserAccount
                .filter(userAccount -> userAccount.getPasswordHash() != null 
                        && passwordEncoder.matches(rawPassword, userAccount.getPasswordHash()))
                .map(userAccount -> {
                    // Nếu mật khẩu đúng, cập nhật trạng thái email và trả về UserAccount
                    String email = userAccount.getUser().getEmail();
                    userRegistrationService.updateUserEmailStatus(email, emailStatus.ACTIVE);
                    return userAccount; // Trả về UserAccount nếu mật khẩu hợp lệ
                })
                .orElse(null); // Nếu không có UserAccount hợp lệ hoặc mật khẩu sai, trả về null
    }



    public UserAccount loginWithGoogle(String googleId) {
        return userAccountRepository.findByGoogleId(googleId).orElse(null);
    }

    // Consider making save transactional if multiple operations happen
    @Transactional
    public void save(UserAccount user) {
        // Ensure updatedAt is set on manual saves if needed,
        // although @PreUpdate handles it for managed entities.
        userAccountRepository.save(user);
    }

    // It's good practice to also check email uniqueness when associating a Google ID
    @Transactional
    public UserAccount findOrCreateGoogleUser(String googleId, String email, String usernameSuggestion) {
        // 1. Check by Google ID
        Optional<UserAccount> existingByGoogleId = userAccountRepository.findByGoogleId(googleId);
        if (existingByGoogleId.isPresent()) {
            return existingByGoogleId.get();
        }

        // 2. Check by Email (if Google ID not found)
        Optional<UserInformation> existingByEmail = userInformationRepository.findByEmail(email);
        if (existingByEmail.isPresent()) {
            // User exists but Google ID not linked. Link it.
            UserAccount user = existingByEmail.get().getAccount();
            if (user.getGoogleId() == null) {
                user.setGoogleId(googleId);
                // user.setUpdatedAt(LocalDateTime.now()); // @PreUpdate handles this
                return userAccountRepository.save(user);
            } else {
                // Email associated with a DIFFERENT Google account. This shouldn't happen with verified emails usually.
                // Handle this conflict - maybe throw an error or log a warning.
                throw new IllegalStateException("Email " + email + " is already linked to a different Google account.");
            }
        }

        // 3. User not found by Google ID or Email - Create new user
        UserInformation newUser = new UserInformation();
        UserAccount userAccount = new UserAccount();
        // Generate a unique username if the suggestion conflicts
        String finalUsername = usernameSuggestion;
        int suffix = 1;
        while (userAccountRepository.findByUsername(finalUsername).isPresent()) {
            finalUsername = usernameSuggestion + "_" + suffix++;
        }
        newUser.setRole(UserRole.CLIENT);
        userAccount.setUsername(finalUsername);

        userAccount.setGoogleId(googleId);
         // Default role for Google sign-up
        // Password hash can be null or a non-usable placeholder if password login is disabled for Google users
        userAccount.setPasswordHash(null); // Or use passwordEncoder.encode(UUID.randomUUID().toString());
        // createdAt/updatedAt handled by annotations
        userInformationRepository.save(newUser);
        return userAccountRepository.save(userAccount);
    }
    
 

    

    
   



}