package com.example.washgo.controller;

import com.example.washgo.service.StampService;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
// ... other imports

@RestController
@RequestMapping("/api/stamps")
public class StampController {

    private final StampService stampService; // Assuming StampService injection

    public StampController(StampService stampService) {
        this.stampService = stampService;
    }

    @GetMapping("/client/{clientId}/carwash/{carwashId}")
//    @PreAuthorize("isAuthenticated()") // Or more specific authorization
    public ResponseEntity<Integer> getStampCount(@PathVariable Long clientId, @PathVariable Long carwashId) {
        // Add authorization check: Ensure the requesting user matches clientId or is ADMIN
        // Example: checkUserAuthorization(authentication, clientId);
        try {
            int count = stampService.getStampCountForClientAndCarwash(clientId, carwashId);
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            // Log error
            return ResponseEntity.status(500).build(); // Internal Server Error
        }
    }
}