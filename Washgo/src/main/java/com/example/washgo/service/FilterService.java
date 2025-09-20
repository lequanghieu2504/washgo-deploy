package com.example.washgo.service;

import com.example.washgo.dtos.CarwashFilterListDTO;
import com.example.washgo.dtos.CarwashFilterMapDTO;
import com.example.washgo.dtos.CarwashProfileFilterCriticcal;
import com.example.washgo.model.CarwashProfile;
import com.example.washgo.service.CarwashService;
import com.example.washgo.service.PricingService;
import com.example.washgo.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class FilterService {

    private final CarwashService carwashService;
    private final ProductService productService;
    private final FeedbackService feedbackService;

//    public List<CarwashProfile> filterNearbyCarwashes (double lat, double lon){
//        return carwashService.filterNearbyCarwashes(lat, lon);
//    }

    public List<CarwashFilterMapDTO> getCarwashesForMap(LocalTime localTime) {
        return carwashService.getCarwashesForMap(localTime);
    }

    public List<CarwashFilterListDTO> findActiveCarwashesByUserTime(LocalTime localTime){
        return carwashService.findActiveCarwashesByUserTime(localTime);
    }

	public List<CarwashFilterListDTO> filterCarwashes(CarwashProfileFilterCriticcal criteria) {
		
		return carwashService.filterCarwashes(criteria);
	}
}
