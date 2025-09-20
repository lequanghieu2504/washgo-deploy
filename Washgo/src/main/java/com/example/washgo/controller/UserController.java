package com.example.washgo.controller;

import com.example.washgo.dtos.ClientProfileDTO;
import com.example.washgo.dtos.ClientProfileUpdateDTO;
import com.example.washgo.service.UserInformationService;
import com.example.washgo.service.UserRegistrationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class UserController {

    @Autowired
    private UserRegistrationService userRegistrationService;
    @Autowired
	private UserInformationService userInformationService;
    
    @PostMapping("/user/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String newPassword = request.get("newPassword");

        if (email == null || newPassword == null || email.isBlank() || newPassword.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email và mật khẩu mới là bắt buộc."));
        }

        return  userRegistrationService.updateUserPassword(email, newPassword);
    }
    
    @GetMapping("/user/ClientInformation")
    public ResponseEntity<ClientProfileDTO> getClientProfile(@RequestParam("userId") Long userId) {
        ClientProfileDTO profile = userInformationService.getClientProfile(userId);
        return ResponseEntity.ok(profile);
    }

    
    @PostMapping("/user/updateClientInformation")
    public ResponseEntity<String> updateClientProfile(@RequestBody ClientProfileUpdateDTO updateDTO){
        boolean updated = userInformationService.updateClientProfile(updateDTO);
        if (updated) {
            return ResponseEntity.ok("Client profile updated successfully.");
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
}
