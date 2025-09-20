package com.example.washgo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class MailService {
	 @Autowired
	    private JavaMailSender mailSender;	  
	    public void sendMailToUser(String toEmail, String subject, String body) throws Exception {
	    	try {
	            SimpleMailMessage message = new SimpleMailMessage();
	            message.setFrom("tapp13459@gmail.com"); // Đảm bảo là email gửi hợp lệ
	            message.setTo(toEmail);
	            message.setSubject(subject);
	            message.setText(body);

	            mailSender.send(message);

	        } catch (Exception e) {
	            e.printStackTrace();}
	    }

}
