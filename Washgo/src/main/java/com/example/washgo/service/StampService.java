package com.example.washgo.service;

import java.util.Optional;

import org.springframework.stereotype.Service;

import com.example.washgo.model.Stamp;
import com.example.washgo.repository.StampRepository;
@Service		
public class StampService {
	private UserRegistrationService userRegistrationService;
	private StampRepository stampRepository;
	
	  public StampService(UserRegistrationService userRegistrationService, StampRepository stampRepository) {
	        this.userRegistrationService = userRegistrationService;
	        this.stampRepository = stampRepository;
	    }
	public Stamp addStamp(Long client_id,Long carwash_id) {
		Stamp stamp = new Stamp();
		stamp.setClientProfile(userRegistrationService.findClientById(client_id));
		stamp.setCarwash_id(carwash_id);
		
		
		return stampRepository.save(stamp)  ;
	}

	
	public void save(Stamp newStamp) {
    stampRepository.save(newStamp);
    }

	public int getStampCountForClientAndCarwash(Long clientId, Long carwashId) {
		// Assuming StampRepository has a method like this:
		// Optional<Stamp> findByClientProfileIdAndCarwashId(Long clientId, Long carwashId);
		Optional<Stamp> stampOpt = stampRepository.findByClientProfileIdAndCarwash_id(clientId, carwashId);
		return stampOpt.map(Stamp::getCount).orElse(0); // Return 0 if no stamp record found
	}

}
