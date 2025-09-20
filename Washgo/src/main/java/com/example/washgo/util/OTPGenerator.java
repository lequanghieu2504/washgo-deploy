package com.example.washgo.util;
import java.security.SecureRandom;


public class OTPGenerator {
	 private static final String CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
	    private static final int OTP_LENGTH = 6;

	    public static String generateOTP() {
	        SecureRandom random = new SecureRandom();
	        StringBuilder otp = new StringBuilder();

	        for (int i = 0; i < OTP_LENGTH; i++) {
	            int index = random.nextInt(CHARACTERS.length());
	            otp.append(CHARACTERS.charAt(index));
	        }

	        return otp.toString();
	    }

	    public static void main(String[] args) {
	        System.out.println("Generated OTP: " + generateOTP());
	    }
	}
