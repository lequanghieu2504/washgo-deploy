package com.example.washgo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.washgo.repository.VerificationOTPRepository;

import jakarta.transaction.Transactional;

@Service
public class OtpService {
    @Autowired
    private VerificationOTPRepository otpRepo;
    @Transactional
    public boolean deleteByEmail(String email) {
        return otpRepo.deleteByEmail(email) > 0;
    }
}
