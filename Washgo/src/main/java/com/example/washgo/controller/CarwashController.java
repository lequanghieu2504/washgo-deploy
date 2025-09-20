package com.example.washgo.controller;

import com.example.washgo.dtos.BookingRequestDTO;
import com.example.washgo.dtos.CarwashDTO;
import com.example.washgo.dtos.ProductDTO;
import com.example.washgo.dtos.ProductMasterDTO;
import com.example.washgo.dtos.TimeRequestDTO;
import com.example.washgo.model.CarwashProfile;
import com.example.washgo.repository.CarwashProfileRepository;
import com.example.washgo.service.CarwashService;
import com.example.washgo.service.ProductMasterService;
import com.example.washgo.service.ProductService;

import lombok.Data;

import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.security.PublicKey;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/carwashes")
public class CarwashController {

    private final CarwashService carwashService;
    private final ProductService productService; // Inject ProductService instead

    // Updated Constructor
    public CarwashController(CarwashService carwashService, ProductMasterService productMasterService, ProductService productService) {
        this.carwashService = carwashService;
        this.productService = productService;
    }


    // Existing endpoints for listing/getting carwashes...

    /**
     * Get a list of car washes, with optional filtering and sorting.
     * (Existing method - no changes needed here)
     */
    @GetMapping
    public ResponseEntity<List<CarwashDTO>> getCarwashes(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false, defaultValue = "ASC") String sortDir) {

        Optional<String> nameFilter = Optional.ofNullable(name);
        Optional<String> locationFilter = Optional.ofNullable(location);
        Optional<String> sortField = Optional.ofNullable(sortBy);
        // Handle potential invalid sortDir value gracefully
        Sort.Direction direction;
        try {
            direction = Sort.Direction.fromString(sortDir.toUpperCase());
        } catch (IllegalArgumentException e) {
            direction = Sort.Direction.ASC; // Default to ASC if invalid value provided
        }


        List<CarwashDTO> carwashes = carwashService.findCarwashes(
                nameFilter, locationFilter, sortField, Optional.of(direction)
        );

        return ResponseEntity.ok(carwashes);
    }

    /**
     * Get a specific car wash by its user ID.
     * (Existing method - no changes needed here)
     */
    @GetMapping("/{id}")
    public ResponseEntity<CarwashDTO> getCarwashDTOById(@PathVariable Long id) {
        return carwashService.findCarwashDTOById(id)
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Carwash not found with id: " + id));
    }

// --- UPDATED ENDPOINT to get specific Product Offerings ---
    /**
     * Get all Product offerings for a specific car wash.
     * @param id The user ID of the car wash owner.
     * @return A list of ProductDTOs offered by the car wash.
     */
    @GetMapping("/{id}/products")
    // @PreAuthorize("isAuthenticated()") // Ensure authenticated if not public
    public ResponseEntity<List<ProductDTO>> getCarwashProducts(@PathVariable Long id) {
        // Note: Service method now returns List<ProductDTO> directly
        // or handles mapping internally
        try {
            // Call the method in ProductService now
            List<ProductDTO> products = carwashService.findProductsByCarwash(id);
            return ResponseEntity.ok(products);
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            // Log error
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error retrieving product offerings for carwash", e);
        }
    }
    private static final Double DEFAULT_RADIUS_KM = 50.0;

    @GetMapping("/search")
    public List<String> search(@RequestParam String query) {
        return carwashService.searchCarwashNames(query);
    }

}



