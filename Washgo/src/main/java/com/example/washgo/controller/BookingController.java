package com.example.washgo.controller;

import com.example.washgo.dtos.BookingDTO;
import com.example.washgo.dtos.BookingResponseDTO;
import com.example.washgo.dtos.BookingResponseForClientDTO;
import com.example.washgo.dtos.BookingUpdateRequestDTO;
import com.example.washgo.model.Booking;
import com.example.washgo.model.CarwashProfile;
import com.example.washgo.model.Feedback;
import com.example.washgo.model.UserInformation;
import com.example.washgo.repository.UserInformationRepository;
import com.example.washgo.service.BookingService;
import com.example.washgo.service.CarwashService;
import com.example.washgo.util.SecurityUtils;

import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import com.example.washgo.enums.BookingStatus;

import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException; // Can remove if only using EntityNotFoundException
import java.util.Optional;

@Controller
@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private static final Logger logger = LoggerFactory.getLogger(BookingController.class);
    @Autowired
    private final BookingService bookingService;
    private final UserInformationRepository userRepository;
    private final CarwashService carwashService;
    @Autowired
    private SecurityUtils securityUtils;

    public BookingController(BookingService bookingService,
                             UserInformationRepository userRepository,
                             CarwashService carwashService) {
        this.bookingService = bookingService;
        this.userRepository = userRepository;
        this.carwashService = carwashService;
    }
    
    // --- Helper Method to Get Authenticated User ID ---
    private Long getAuthenticatedUserId(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated() || authentication.getPrincipal() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User is not authenticated");
        }

        Object principal = authentication.getPrincipal();
        String username = null;

        // --- Determine username based on principal type ---
        if (principal instanceof org.springframework.security.oauth2.jwt.Jwt) {
            org.springframework.security.oauth2.jwt.Jwt jwt = (org.springframework.security.oauth2.jwt.Jwt) principal;
            username = jwt.getSubject();
        } else if (principal instanceof org.springframework.security.core.userdetails.UserDetails) {
            username = ((org.springframework.security.core.userdetails.UserDetails) principal).getUsername();
        } else if (principal instanceof String) {
            username = (String) principal;
        } else {
            logger.error("Unexpected principal type: {}", principal.getClass().getName());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Cannot determine username from authentication principal");
        }

        // --- Check if username was found ---
        if (username == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Username not found in authentication principal");
        }

        // --- Fetch User ID using the effectively final username ---
        // Define final variable for use in lambda
        final String finalUsername = username;
        Optional<UserInformation> userOpt = userRepository.findByAccountUsername(finalUsername);
        return userOpt.map(UserInformation::getId)
                .orElseThrow(() -> {
                    // Note: finalUsername is used here from the outer scope
                    logger.error("Authenticated user '{}' not found in database", finalUsername);
                    return new ResponseStatusException(HttpStatus.NOT_FOUND, "Authenticated user '" + finalUsername + "' not found in database");
                });
    }


    @PostMapping("/create")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> createBooking(@Valid @RequestBody BookingDTO bookingDTO, Authentication authentication) {
        try {
            // --- CHECK IF USER HAS ROLE 'ROLE_CLIENT' ---
            if (authentication == null || authentication.getAuthorities().stream()
                    .noneMatch(auth -> auth.getAuthority().equals("ROLE_CLIENT"))) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("message", "You are not allowed to perform this action. Only clients can create bookings."));
            }

            // --- CREATE BOOKING ---
            ResponseEntity<?> bookingResponse = bookingService.createBooking(bookingDTO);

            if (!bookingResponse.getStatusCode().is2xxSuccessful()) {
                return bookingResponse;
            }

            // Ép kiểu rõ ràng về BookingDTO
            ResponseEntity<?>createdBooking =  bookingResponse;




            return createdBooking;

        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            logger.error("Error creating booking", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error creating booking"));
        }
    }

    @PostMapping("/bookingByPhoneNumber")
    public ResponseEntity<?> createBookingByPhoneNumber(@Valid @RequestBody BookingDTO bookingDTO) {
        try {

            ResponseEntity<?> createdBookingByPhoneNumber = bookingService.createBookingByPhoneNumber(bookingDTO);
            return createdBookingByPhoneNumber;
        } catch (EntityNotFoundException e) {
            logger.error("Entity not found: ", e);
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e);
        } catch (Exception e) {
            logger.error("Error creating booking by phone number", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error creating booking by phone number", e);
        }
    }

    // --- READ All (GET) --- Admin Only
    @GetMapping("/getAllBooking")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<BookingDTO>> getAll() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    // --- NEW ENDPOINT: Get Bookings for Authenticated Client ---
    @GetMapping("/my-bookings")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<List<BookingResponseForClientDTO>> getMyBookings(Authentication authentication) {
        try {
            Long clientId = getAuthenticatedUserId(authentication);
            List<BookingResponseForClientDTO> bookings = bookingService.getBookingsForClient(clientId);
            return ResponseEntity.ok(bookings);
        } catch (Exception e) {
            logger.error("Error retrieving bookings for client", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error retrieving your bookings", e);
        }
    }

    // --- NEW ENDPOINT: Get Bookings for Authenticated Car Wash ---
    @GetMapping("/carwash-bookings")
    @PreAuthorize("hasRole('CARWASH')")
    public ResponseEntity<List<BookingDTO>> getCarwashBookings(Authentication authentication) {
        Long carwashOwnerUserId = null; // Initialize to null
        try {
            carwashOwnerUserId = getAuthenticatedUserId(authentication);
            CarwashProfile carwashProfile = carwashService.findCarwashByUserId(carwashOwnerUserId);
            List<BookingDTO> bookings = bookingService.getBookingsForCarwash(carwashProfile.getId());
            return ResponseEntity.ok(bookings);
            // --- CORRECTED CATCH BLOCK ---
        } catch (RuntimeException e) { // Catch RuntimeException (covers EntityNotFoundException)
            String userIdForLog = (carwashOwnerUserId != null) ? carwashOwnerUserId.toString() : "UNKNOWN (Auth Error)";
            // Log specific subclass name if possible
            logger.warn("Could not find carwash profile for user ID {} or user is not a carwash. Exception: {}", userIdForLog, e.getClass().getSimpleName(), e);
            // Check the cause or type if needed for specific messages
            if (e instanceof EntityNotFoundException) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Carwash profile not found for the authenticated user.", e);
            }
            // Handle other potential RuntimeExceptions from findCarwashByUserId or getBookingsForCarwash
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error retrieving carwash bookings.", e);

        } catch (Exception e) { // Catch broader exceptions as a fallback
            String userIdForLog = (carwashOwnerUserId != null) ? carwashOwnerUserId.toString() : "UNKNOWN (Auth Error)";
            logger.error("Unexpected error retrieving bookings for carwash owner ID {}", userIdForLog, e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error retrieving carwash bookings", e);
        }
    }


    // --- READ One (GET by ID) ---
    @GetMapping("/{bookingId}")
//    @PreAuthorize("hasRole('ADMIN') or @bookingSecurityService.isOwner(#bookingId, authentication) or @bookingSecurityService.isCarwashOwner(#bookingId, authentication)")
    public ResponseEntity<BookingDTO> getBooking(@PathVariable Long bookingId, Authentication authentication) {
        try {
            BookingDTO booking = bookingService.getBooking(bookingId);
            return ResponseEntity.ok(booking);
        } catch (EntityNotFoundException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e);
        }
        catch (Exception e) {
            logger.error("Error retrieving booking {}", bookingId, e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error retrieving booking", e);
        }
    }

//    // --- UPDATE (PUT) ---
//    @PutMapping("/{bookingId}")
//    @PreAuthorize("hasRole('ADMIN') or @bookingSecurityService.isOwner(#bookingId, authentication) or @bookingSecurityService.isCarwashOwner(#bookingId, authentication)")
//    public ResponseEntity<BookingDTO> updateBooking(@PathVariable Long bookingId,
//                                                    @Valid @RequestBody BookingDTO updateData,
//                                                    Authentication authentication) {
//        try {
//            BookingDTO existing = bookingService.getBooking(bookingId);
//            if (!hasRole(authentication, "ADMIN")) {
//                if (updateData.getClientId() != null && !updateData.getClientId().equals(existing.getClientId())) {
//                    throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot change the client ID of a booking.");
//                }
//                if (updateData.getCarwashId() != null && !updateData.getCarwashId().equals(existing.getCarwashId())) {
//                    throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot change the carwash ID of a booking.");
//                }
//                if (updateData.getScheduleId() != 0 && updateData.getScheduleId() != existing.getScheduleId()) {
//                    throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot change the schedule of a booking via this method.");
//                }
//            }
//            BookingDTO updatedBooking = bookingService.updateBooking(bookingId, updateData);
//            return ResponseEntity.ok(updatedBooking);
//
//        } catch (EntityNotFoundException e) {
//            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e);
//        } catch (IllegalStateException e) {
//            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage(), e);
//        } catch (ResponseStatusException e) { // Re-throw specific forbidden/bad request exceptions
//            throw e;
//        }
//        catch (Exception e) {
//            logger.error("Error updating booking {}", bookingId, e);
//            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error updating booking", e);
//        }
//    }

    // --- DELETE (DELETE by ID) ---
    @DeleteMapping("/{bookingId}")
    @PreAuthorize("hasRole('ADMIN') or @bookingSecurityService.isOwner(#bookingId, authentication) or @bookingSecurityService.isCarwashOwner(#bookingId, authentication)")
    public ResponseEntity<Void> deleteBooking(@PathVariable Long bookingId, Authentication authentication) {
        try {
            bookingService.deleteBooking(bookingId);
            return ResponseEntity.noContent().build();
        } catch (EntityNotFoundException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e);
        } catch (IllegalStateException e) {
            if (!hasRole(authentication, "ADMIN")) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage(), e);
            } else {
                logger.warn("Admin deleting booking {} despite potential IllegalStateException: {}", bookingId, e.getMessage());
                bookingService.deleteBooking(bookingId);
                return ResponseEntity.noContent().build();
            }
        } catch (Exception e) {
            logger.error("Error deleting booking {}", bookingId, e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error deleting booking", e);
        }
    }
    
  

    @PutMapping("/manager/update/{bookingId}")
    public ResponseEntity<?> updateBooking(
            @PathVariable Long bookingId,
            @RequestBody BookingUpdateRequestDTO requestDto,
            Authentication authentication) {

        Long carwashId = securityUtils.getAuthenticatedUserId(authentication);
        return bookingService.updateBookingManager(carwashId, bookingId, requestDto);
    }

    
    // --- Existing Cancel Endpoint (POST) ---
//    @PostMapping("/{bookingId}/cancel")
//    @PreAuthorize("hasRole('ADMIN') or hasRole('CARWASH')")
//    public ResponseEntity<String> cancelBooking(@PathVariable Long bookingId, Authentication authentication) {
//        try {
//            bookingService.cancelBooking(bookingId);
//            return ResponseEntity.ok("Booking cancelled successfully.");
//        } catch (EntityNotFoundException e) {
//            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e);
//        } catch (IllegalStateException e) {
//            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage(), e);
//        } catch (Exception e) {
//            logger.error("Error cancelling booking {}", bookingId, e);
//            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error cancelling booking", e);
//        }
//    }

    // Helper to check roles easily
    private boolean hasRole(Authentication authentication, String roleName) {
        if (authentication == null || authentication.getAuthorities() == null) {
            return false;
        }
        return authentication.getAuthorities().stream()
                .anyMatch(grantedAuthority -> grantedAuthority.getAuthority().equals("ROLE_" + roleName));
    }

    

//    // --- Existing Validate Endpoint ---
//    @GetMapping("/{bookingId}/validate")
//    @PreAuthorize("isAuthenticated()")
//    public ResponseEntity<String> validate(@PathVariable Long bookingId) {
//        final String STATUS_ACTIVE = "ACTIVE"; // Define constant locally or import if public static final
//        try {
//            if (bookingService.isValid(bookingId)) {
//                return ResponseEntity.ok("Booking is valid.");
//            } else {
//                String reason = "Booking is not valid (e.g., expired, inactive schedule, or status not ACTIVE).";
//                try {
//                    BookingDTO booking = bookingService.getBooking(bookingId); // Get DTO to check status
//                    if (booking != null && !((BookingStatus.ACCEPTED )  == (booking.getStatus()))) {
//                        reason = "Booking status is not ACTIVE ("+booking.getStatus()+").";
//                    }
//                } catch (EntityNotFoundException enfe) {
//                    // If booking not found here, it means isValid likely threw it earlier or handled it.
//                    // The outer catch will handle it if needed.
//                }
//                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(reason);
//            }
//        } catch (EntityNotFoundException e) {
//            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e);
//        } catch (IllegalStateException e) {
//            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage(), e);
//        } catch (Exception e) {
//            logger.error("Error validating booking {}", bookingId, e);
//            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error validating booking", e);
//        }
//    }
//    @GetMapping("/group-by-product-master")
//    public ResponseEntity<Map<Long, Map<String, Object>>> getBookingsGroupedByProductMaster(@RequestParam Long carwashId) {
//        Map<Long, Map<String, Object>> groupedBookings = bookingService.groupBookingsByProductMaster(carwashId);
//        return ResponseEntity.ok(groupedBookings);
//    }


}