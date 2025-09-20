package com.example.washgo.service;

import org.springframework.stereotype.Service;

import com.example.washgo.model.UserAccount;
import com.example.washgo.repository.UserAccountRepository;

import jakarta.persistence.EntityNotFoundException;
@Service
public class UserAccountService {

	private final UserAccountRepository userAccountRepository;

public UserAccountService(UserAccountRepository userAccountRepository) {
	this.userAccountRepository = userAccountRepository;
}

	public UserAccount findById(Long id) {
		UserAccount user = userAccountRepository.findById(id)
			    .orElseThrow(() -> new EntityNotFoundException("UserAccount not found with id: " + id));
		return user;

	}
}
