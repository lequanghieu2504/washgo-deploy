package com.example.washgo.util;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import com.example.washgo.model.UserAccount;
import com.example.washgo.service.UserInformationService;

@Component
public class SecurityUtils {
     @Autowired
    private final UserInformationService userInformationService;

    public SecurityUtils(UserInformationService userInformationService) {
        this.userInformationService = userInformationService;
    }

    public Long getAuthenticatedUserId(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User is not authenticated");
        }

        String username = authentication.getName();
        if (username == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Username not found in authentication principal");
        }

        Optional<UserAccount> userOpt = userInformationService.findByUserName(username);
        return userOpt.map(UserAccount::getId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Authenticated user '" + username + "' not found in database"));
    }
}
