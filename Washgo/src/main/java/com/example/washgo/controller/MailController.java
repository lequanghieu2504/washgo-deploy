package com.example.washgo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.web.bind.annotation.*;

@RestController
public class MailController {

    @Autowired
    private JavaMailSender mailSender;

    @GetMapping("/sendTestMail")
    public String sendTestMail(@RequestParam String toEmail) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("tapp13459@gmail.com"); // Đảm bảo là email gửi hợp lệ
            message.setTo(toEmail);
            message.setSubject("Test Mail từ Spring Boot");
            message.setText("Đây là email test gửi từ Spring Boot Application");

            mailSender.send(message);
            return "Đã gửi email tới: " + toEmail;

        } catch (Exception e) {
            e.printStackTrace();
            return "Lỗi gửi mail: " + e.getMessage();
        }
    }
}
