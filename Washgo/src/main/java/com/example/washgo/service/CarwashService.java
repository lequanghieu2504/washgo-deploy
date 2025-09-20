// src/main/java/com/example/washgo/service/CarwashService.java
package com.example.washgo.service;

import com.example.washgo.dtos.*;
import com.example.washgo.enums.UserRole;
import com.example.washgo.mapper.CarwashMapper;
import com.example.washgo.mapper.UserMapper;
import com.example.washgo.service.*;
import com.example.washgo.model.CarwashProfile;
import com.example.washgo.model.UserAccount;
import com.example.washgo.model.UserInformation;
import com.example.washgo.repository.CarwashProfileRepository;
import com.example.washgo.repository.UserAccountRepository;
import com.example.washgo.repository.UserInformationRepository;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import lombok.Value;

import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;

import org.hibernate.query.Page;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Order;
import org.springframework.data.util.Streamable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.awt.print.Pageable;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class CarwashService {

	  private final UserInformationRepository userRepository;
	    private final CarwashProfileRepository carwashProfileRepository;
	    private final UserMapper userMapper;
	    private final ProductService productService;
	    private final UserAccountRepository userAccountRepository;
	    private final double RADIUS_KM = 10;
	    private final int LIMIT = 20;


    @Transactional(readOnly = true)
    public List<CarwashDTO> findCarwashes(Optional<String> nameFilter,
                                          Optional<String> locationFilter,
                                          Optional<String> sortBy,
                                          Optional<Sort.Direction> sortDirection) {

        // Start with users who are carwash owners
    	Stream<UserInformation> carwashUsersStream = userRepository.findAll().stream()
    		    .filter(infor -> infor.getRole() == UserRole.CARWASH)
    		    .filter(infor -> infor != null)
    		    .filter(infor -> infor.getCarwashProfile() != null);


        // Apply filters (same as before)
        if (nameFilter.isPresent() && !nameFilter.get().isBlank()) {
            String nameLower = nameFilter.get().toLowerCase();
            carwashUsersStream = carwashUsersStream.filter(user ->
                    user.getCarwashProfile().getCarwashName() != null &&
                            user.getCarwashProfile().getCarwashName().toLowerCase().contains(nameLower)
            );
        }

        if (locationFilter.isPresent() && !locationFilter.get().isBlank()) {
            String locationLower = locationFilter.get().toLowerCase();
            carwashUsersStream = carwashUsersStream.filter(user ->
                    user.getCarwashProfile().getLocation() != null &&
                            user.getCarwashProfile().getLocation().toLowerCase().contains(locationLower)
            );
        }

        // Prepare comparator for sorting
        Comparator<CarwashDTO> comparator = null;
        if (sortBy.isPresent()) {
            // --- ADD SORT BY RATING ---
            comparator = switch (sortBy.get().toLowerCase()) {
                case "name" -> Comparator.comparing(CarwashDTO::getCarwashName, Comparator.nullsLast(String::compareToIgnoreCase));
                case "location" -> Comparator.comparing(CarwashDTO::getLocation, Comparator.nullsLast(String::compareToIgnoreCase));
                case "rating" -> Comparator.comparing(CarwashDTO::getAverageRating, Comparator.nullsLast(Double::compareTo)); // Sort by rating, nulls last
                // Add more sortable fields if needed
                default -> null; // No specific sort or invalid field
            };

            if (comparator != null && sortDirection.isPresent() && sortDirection.get() == Sort.Direction.DESC) {
                comparator = comparator.reversed();
                // Special handling for nulls when reversing rating sort (to keep nulls last)
                if (sortBy.get().equalsIgnoreCase("rating")) {
                    comparator = Comparator.comparing(CarwashDTO::getAverageRating, Comparator.nullsLast(Double::compareTo)).reversed();
                }
            }
        }

        // Map to DTOs *before* final sorting if sorting is applied
        List<CarwashDTO> carwashDTOs = carwashUsersStream
                .map(userMapper::toCarwashDTO)
                .collect(Collectors.toList());

        // Apply sorting if comparator was created
        if (comparator != null) {
            carwashDTOs.sort(comparator);
        } else {
            // Default sort if no specific sort requested (e.g., by ID or name)
            carwashDTOs.sort(Comparator.comparing(CarwashDTO::getId, Comparator.nullsLast(Long::compareTo)));
        }

        return carwashDTOs;
    }
//return DTO
    @Transactional(readOnly = true)
    public Optional<CarwashDTO> findCarwashDTOById(Long id) {
        return userRepository.findById(id)
                .filter(user -> user != null 
                        && user.getRole() != null 
                        && user.getRole() == UserRole.CARWASH 
                        && user.getCarwashProfile() != null)
                .map(userMapper::toCarwashDTO);
    }
    
//return carwashProfile
    @Transactional(readOnly = true)
    public CarwashProfile findCarwashByUserId(Long userId) {
        if (userId == null) {
            throw new IllegalArgumentException("User ID cannot be null");
        }

        return userRepository.findById(userId)
            .filter(user -> user.getRole() == UserRole.CARWASH && user.getCarwashProfile() != null)
            .map(UserInformation::getCarwashProfile)
            .orElseThrow(() -> new RuntimeException("Carwash profile not found or user is not a carwash  " + userId));
    }

    public void save(CarwashProfile carwashProfile) {
    	carwashProfileRepository.save(carwashProfile);
	}


//    private static final double DEFAULT_RADIUS_KM = 50.0;
//    public List<Map<String, Object>> filterCarwashes(
//            Double userLat,
//            Double userLon,
//            String category,
//            LocalDateTime requestedTime,
//            Double radiusKm
//    ) {
//        List<Object[]> results = carwashProfileRepository.findAvailableCarwashesByCategoryAndTime(userLat, userLon, category, requestedTime, radiusKm);
//
//        List<Map<String, Object>> nearbyCarwashes = new ArrayList<>(results.size());
//        for (Object[] row : results) {
//            Map<String, Object> carwashData = new HashMap<>();
//            carwashData.put("id",           ((Number) row[0]).longValue());
//            carwashData.put("carwash_name", (String) row[1]);
//            //convert latitude/longitude từ string -> double:
//            try {
//                carwashData.put("latitude",  Double.valueOf((String) row[2]));
//                carwashData.put("longitude", Double.valueOf((String) row[3]));
//            } catch (NumberFormatException ex) {
//                //string không parse thì giữ nguyên string hoặc cho giá trị null
//                carwashData.put("latitude",  row[2]);
//                carwashData.put("longitude", row[3]);
//            }
//            carwashData.put("distance",   (Double) row[4]);
//            nearbyCarwashes.add(carwashData);
//        }
//        return nearbyCarwashes;
//    }

    public List<CarwashProfile> filterNearbyCarwashes(List<CarwashProfile> result, String latitude, String Longitude) {

        return result.stream()
                .filter(carwash -> {
                    double distance = calculateDistance(
                            latitude, Longitude,
                            carwash.getLatitude(), carwash.getLongitude()
                    );
                    return distance < RADIUS_KM;
                })
                .sorted(Comparator.comparingDouble(carwash ->
                        calculateDistance(latitude, Longitude,
                                carwash.getLatitude(), carwash.getLongitude())))
                .limit(LIMIT)
                .collect(Collectors.toList());
    }



    private double calculateDistance(String lat1, String lon1, String lat2Str, String lon2Str) {
        final int R = 6371; // Earth radius in km

        // Check if any value is null
        if (lat1 == null || lon1 == null || lat2Str == null || lon2Str == null) {
            return -1; // hoặc throw exception hoặc return 0 tùy nhu cầu
        }

        double lat2 = parseDoubleSafe(lat2Str);
        double lon2 = parseDoubleSafe(lon2Str);
        double lat1Double = parseDoubleSafe(lat1);
        double lon1Double = parseDoubleSafe(lon1);

        double latDistance = Math.toRadians(lat2 - lat1Double);
        double lonDistance = Math.toRadians(lon2 - lon1Double);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1Double)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }


    private double parseDoubleSafe(String value) {
        try {
            return Double.parseDouble(value);
        } catch (NumberFormatException | NullPointerException e) {
            throw new IllegalArgumentException("Invalid coordinate value: " + value);
        }
    }

    public List<ProductDTO> findProductsByCarwash(Long carwashOwnerId) {
        return productService.findProductsByCarwash(carwashOwnerId);
    }

    public List<CarwashFilterListDTO> findActiveCarwashesByUserTime(LocalTime localTime) {
        return carwashProfileRepository.findAvailableCarwashesAtTime(localTime)
                .stream()
                .map(CarwashMapper::toFilterListDTO)
                .collect(Collectors.toList());
    }

    public List<CarwashFilterMapDTO> getCarwashesForMap(LocalTime localTime) {
        return carwashProfileRepository.findAvailableCarwashesAtTime(localTime)
                .stream()
                .map(CarwashMapper::toFilterMapDTO)
                .collect(Collectors.toList());
    }

    public List<CarwashFilterListDTO> filterCarwashes(CarwashProfileFilterCriticcal criteria) {
        Specification<CarwashProfile> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (criteria.getCarwashName() != null && !criteria.getCarwashName().isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("carwashName")),
                        "%" + criteria.getCarwashName().toLowerCase() + "%"));
            }

            if (criteria.getLocation() != null && !criteria.getLocation().isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("location")),
                        "%" + criteria.getLocation().toLowerCase() + "%"));
            }

            if (criteria.getMinRating() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("averageRating"), criteria.getMinRating()));
            }

            if (criteria.getMaxRating() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("averageRating"), criteria.getMaxRating()));
            }

            if (criteria.getMinRatingCount() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("ratingCount"), criteria.getMinRatingCount()));
            }

            if (criteria.getDesiredTime() != null) {
                Join<Object, Object> scheduleJoin = root.join("schedule", JoinType.INNER);
                predicates.add(cb.lessThanOrEqualTo(scheduleJoin.get("availableFrom"), criteria.getDesiredTime()));
                predicates.add(cb.greaterThanOrEqualTo(scheduleJoin.get("availableTo"), criteria.getDesiredTime()));
                predicates.add(cb.isTrue(scheduleJoin.get("isActive"))); // chỉ chọn lịch hoạt động
            }

            if (criteria.getProductMasterId() != -1) {
                Join<Object, Object> productJoin = root.join("Products", JoinType.INNER);
                predicates.add(cb.equal(productJoin.get("productMaster").get("id"), criteria.getProductMasterId()));
            }



            return cb.and(predicates.toArray(new Predicate[0]));
        };

        List<CarwashProfile> result = carwashProfileRepository.findAll(spec);

        
        if(criteria.getLatitude() != null && criteria.getLongitude() != null) {
        	result = filterNearbyCarwashes(result,criteria.getLatitude(), criteria.getLongitude());
        }
        
        return result.stream()
                     .map(CarwashMapper::toFilterListDTO)
                     .collect(Collectors.toList());
    }
    public List<String> searchCarwashNames(String keyword) {
     return carwashProfileRepository.searchWith10CarwashsFollowByKeyword(keyword);
    }

}