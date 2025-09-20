package com.example.washgo.service;

import com.example.washgo.dtos.*;
import com.example.washgo.enums.BookingStatus;
import com.example.washgo.mapper.BookingMapper;
import com.example.washgo.mapper.ProductMapper;
import com.example.washgo.model.*;
import com.example.washgo.repository.BookingRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
	
import jakarta.persistence.EntityNotFoundException;

import java.time.LocalDate;

// *** ADD Logger Imports ***
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
// *** END Logger Imports ***
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class BookingService {

    // *** ADD Logger Definition ***
    private static final Logger logger = LoggerFactory.getLogger(BookingService.class);
    private final BookingMapper bookingMapper;
    private final BookingRepository bookingRepository;
    private final ScheduleService scheduleService;
    private final UserRegistrationService userRegistrationService;
    private final CarwashService carwashService;
    private final StampService stampService;
    private final CouponService couponService;
    private final ProductService productService;

  @Autowired
    public BookingService(ProductMapper productMapper,PaymentService paymentService, CouponService couponService, StampService stampService, BookingRepository bookingRepository,
    		ScheduleService scheduleService,UserRegistrationService userRegistrationService, CarwashService carwashService, PricingService pricingService, ProductService productService,ProductMasterService productMasterService, BookingMapper bookingMapper) {
		this.bookingMapper = bookingMapper;
		this.bookingRepository = bookingRepository;
        this.scheduleService = scheduleService ;
        this.userRegistrationService = userRegistrationService;
        this.carwashService = carwashService;
        this.stampService = stampService;
        this.couponService = couponService;
        this.productService = productService;
    }


  @Transactional
    public ResponseEntity<?> createBooking(BookingDTO dto) {
        try {
            CarwashProfile carwash = carwashService.findCarwashByUserId(dto.getCarwashId());

            if (carwash == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "Carwash not found."));
            }

            Schedule schedule = carwash.getSchedule();
            if (schedule == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "Carwash does not have a schedule."));
            }

            // Kiểm tra capacity
            checkScheduleCapacity(dto, carwash);

            // Tạo booking
            Booking booking = buildBookingFromDTO(dto);

            // Áp dụng coupon nếu có
            booking = checkCoupon(dto, booking);

            // Lưu vào database
            bookingRepository.save(booking);

            // Cập nhật lại capacity
            updateCapacityAfterBooking(dto, schedule);

            // Mapping dữ liệu trả về
            BookingResponseDTO newBooking = bookingMapper.toDTOFromBookingResponse(booking);

            Boolean checkStampResult = checkStamp(dto);

            if (checkStampResult) {
                booking.setNotes("Booking success! You earned a Coupon!");
            }

            Map<String, Object> response = new HashMap<>();
            response.put("bookingId", newBooking.getBookingId());

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(response);
        } catch (IllegalStateException e) {
            // Xử lý lỗi do logic business như capacity vượt quá giới hạn, v.v.
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            // Bắt các lỗi khác không mong muốn
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "An unexpected error occurred: " + e.getMessage()));
        }
    }

    
private Booking buildBookingFromDTO(BookingDTO dto) {
    Booking booking = new Booking();
    List<Long> products = dto.getProductsId();

    
    
    CarwashProfile carwash = carwashService.findCarwashByUserId(dto.getCarwashId());
    UserInformation client  = userRegistrationService.findById(dto.getUserId());

    //phan tinh toan
    List<Product> listProduct = productService.toProductList(products);

    LocalDateTime endTime = calculateEndTimeOfBooking(dto.getStartTime(),listProduct);
    
    PricingDTO finalPrice =  CalculateFinalPrice(listProduct);
    
    // Build booking
    LocalDateTime now = LocalDateTime.now();

    booking.setStartTime(dto.getStartTime());
    booking.setEndTime(endTime);

    booking.setCarwash(carwash);
    booking.setUserInformation(client);
    booking.setProducts(listProduct);
    booking.setNotes(dto.getNotes());
    booking.setStatus(BookingStatus.PENDING);
    booking.setCreatedAt(now);
    booking.setUpdatedAt(now);
    booking.setCurrency(finalPrice.getCurrency());
    booking.setTotalPrice(finalPrice.getPrice());
	return booking;
    
	}

private PricingDTO CalculateFinalPrice(List<Product> listProduct) {
	double totalPrice = 0;
	String currency = null;

	if (listProduct == null || listProduct.isEmpty()) {
	    throw new IllegalArgumentException("Product list cannot be empty.");
	}

		for( Product product : listProduct) {
		Pricing pricing = product.getPricing();
	    if (pricing == null) {
	        throw new IllegalStateException("Pricing not found for product: " + product.getId());
	    }
		
	    // Kiểm tra currency nhất quán
	    if (currency == null) {
	        currency = pricing.getCurrency();
	    } else if (!currency.equals(pricing.getCurrency())) {
	        throw new IllegalArgumentException("Products have mixed currencies.");
	    

	    }
	    totalPrice += product.getPricing().getPrice();
	    }

	// Gán giá vào booking
	PricingDTO pricing = new PricingDTO();
	pricing.setPrice(totalPrice);
	pricing.setCurrency(currency);
	
	return pricing;
}

private Booking checkCoupon(BookingDTO dto,Booking newBooking) {
	if(dto.getCouponId()!= null) {
        Coupon coupon = couponService.findById(dto.getCouponId());
        newBooking.setSelectedCoupon(coupon);
        coupon.setActive(false);
        }
	return newBooking;		
	}

private void updateCapacityAfterBooking(BookingDTO dto, Schedule schedule) {
	
	  schedule.setCapacity(schedule.getCapacity() - 1);
      scheduleService.updateScheduleCapacity(schedule);  // you can add this helper in ScheduleService
      logger.info("Capacity decremented for schedule {}: now {}", schedule.getId(), schedule.getCapacity());		
	}

private void checkScheduleCapacity(BookingDTO dto, CarwashProfile carwash) {

	
	int capacity = carwash.getSchedule().getCapacity();
    if (capacity < 1) {
        throw new IllegalStateException("No capacity left for carwash: " + carwash.getCarwashName());
    }
	}

private LocalDateTime calculateEndTimeOfBooking(LocalDateTime startTime, List<Product> products) {
	LocalDateTime endTimeResult = startTime;
	for(Product p : products) {
		endTimeResult = endTimeResult.plusSeconds(p.getTimeming().toSecondOfDay());
	}
	
	return endTimeResult;
	}




    public ResponseEntity<?> createBookingByPhoneNumber(BookingDTO dto){
		 BookingMapper bookingMapper;
    	UserInformation newUser;
    	if (!(userRegistrationService.existsByPhoneNumber(dto.getPhoneNumber()))) {
    		 newUser = userRegistrationService.createUserInformationByPhoneNumber(dto.getPhoneNumber());
    	}
    	else {
    		newUser = userRegistrationService.findByPhoneNumber(dto.getPhoneNumber());
    	}
    	dto.setUserId(newUser.getId());




    	return createBooking(dto);
	}

	
public boolean checkStamp(BookingDTO dto) {
        Stamp temp_Stamp = null;
       	boolean found = false;
       //find stamp list follow by client id
        List<Stamp> Client_Stamp_list = userRegistrationService.findClientById(dto.getUserId()).getListStamps();
    //if empty create one
        if (Client_Stamp_list.isEmpty()) {
        	stampService.addStamp(dto.getUserId(),dto.getCarwashId());
        	return false;
		}
  //find exactly carwash stamp
    	for (Stamp stamp : Client_Stamp_list) {
    	    if (stamp.getCarwash_id() == dto.getCarwashId()) {
    	        found = true;
    	        temp_Stamp = stamp;
    	        break;
    	    }
    	}
    	if(found) {
    		if(temp_Stamp.getCount() == 4) {
    			temp_Stamp.setCount(0);
    			stampService.save(temp_Stamp);
    			couponService.createNewCouponForClientHave5PointInTemp(dto);
    			return true;
    		}
    		else {
    		int temp = temp_Stamp.getCount();
    		temp_Stamp.setCount(temp_Stamp.getCount() + 1);
    		stampService.save(temp_Stamp);
    		return false;
    	}}
    	else {

            stampService.addStamp(dto.getUserId(),dto.getCarwashId());

            return false;
    	}

}

	// --- Cancel Booking Method ---
//    @Transactional
//    public void cancelBooking(Long bookingId) {
//        Booking booking = bookingRepository.findById(bookingId)
//                .orElseThrow(() -> new EntityNotFoundException("Booking not found: " + bookingId));
//
//        if (BookingStatus.CANCEL == (booking.getStatus())) {
//            logger.warn("Booking {} already cancelled.", bookingId);
//            return;
//        }
//        if (BookingStatus.DONE == (booking.getStatus())) {
//            throw new IllegalStateException("Cannot cancel a completed booking.");
//        }
//
//        // Restore capacity
//        Schedule schedule = booking.getSchedule();
//        schedule.setCapacity(schedule.getCapacity() + 1);
//        List<Booking> list = schedule.getBookings();
//        list.remove(booking);
//        scheduleService.updateScheduleCapacity(schedule);
//
//        logger.info("Restored capacity for schedule {}: now {}", schedule.getId(), schedule.getCapacity());
//        //restore the client in schedule slot
//
//        //remove payment
//        // Mark booking cancelled
//        booking.setStatus(BookingStatus.CANCEL);
//        booking.setUpdatedAt(LocalDateTime.now());
//        booking.getSelectedCoupon().setActive(true);
//
//        bookingRepository.save(booking);
//        paymentService.deleteByBookingId(booking.getId());
//
//    }

//--- Get one booking ---
@Transactional(readOnly = true)
public BookingDTO getBooking(Long bookingId) {
    Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new EntityNotFoundException("Booking not found with ID: " + bookingId));
    return bookingMapper.toDTOFromBooking(booking);
}

// --- Get all bookings ---
@Transactional(readOnly = true)
public List<BookingDTO> getAllBookings() {
    List<Booking> bookings = bookingRepository.findAll();
    return bookings.stream()
            .map(bookingMapper::toDTOFromBooking)
            .collect(Collectors.toList());
}

// --- Update booking ---
@Transactional
public BookingDTO updateBooking(Long bookingId, BookingDTO updateData) {
    Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new EntityNotFoundException("Booking not found with ID: " + bookingId));

    if (BookingStatus.CANCEL == booking.getStatus()) {
        throw new IllegalStateException("Cannot update a cancelled booking.");
    }
    if (BookingStatus.DONE == booking.getStatus()) {
        throw new IllegalStateException("Cannot update a completed booking.");
    }

    boolean updated = false;
    if (updateData.getNotes() != null && !updateData.getNotes().equals(booking.getNotes())) {
        booking.setNotes(updateData.getNotes());
        logger.info("Updating notes for booking ID {}", bookingId);
        updated = true;
    }

    if (updated) {
        booking.setUpdatedAt(LocalDateTime.now());
        booking = bookingRepository.save(booking);
    }

    return bookingMapper.toDTOFromBooking(booking);
}

    // --- Delete Booking Method ---
    @Transactional
    public void deleteBooking(Long bookingId) {
        // ... (method body remains the same, including logger usage) ...
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new EntityNotFoundException("Booking not found with ID: " + bookingId));

        logger.warn("Attempting to permanently delete booking ID: {}. Status: {}", bookingId, booking.getStatus()); // Logger usage correct

        bookingRepository.delete(booking);
        logger.info("Deleted booking with ID: {}", bookingId); // Logger usage correct
    }

    // --- isValid Method ---
//    @Transactional(readOnly = true)
//    public boolean isValid(Long bookingId) {
//
//        BookingDTO dto = getBooking(bookingId); // This throws if not found //
//        Schedule schedule = scheduleService.findScheduledId(dto.getScheduleId());
//        // Use constants or Enum for status comparison
//        boolean valid = BookingStatus.ACCEPTED ==(dto.getStatus()) && //
//                schedule.isActive(); // Schedule active status //
////                LocalDateTime.now().isBefore(schedule.getAvailableTo()); //
//        // Removed redundant check and throw, as getBooking handles not found
//        // if (!valid) {
//        //     throw new IllegalStateException("Booking is no longer valid.");
//        // }
//        return valid; // Return the boolean result, controller handles exception if validation needed
//    }
    public Booking findById(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Can not find booking with id: " + id));
    }

    @Transactional(readOnly = true)
    public List<BookingResponseForClientDTO> getBookingsForClient(Long clientId) {
        logger.info("Fetching bookings for client ID: {}", clientId);
        List<Booking> bookings = bookingRepository.findBookingsWithFeedbacksByClientId(clientId);
        return bookings.stream()
                .map(bookingMapper::toBookingResponseToClientDTOFromBooking)
                .collect(Collectors.toList());
    }


    // --- NEW SERVICE METHOD for Carwash Bookings ---
    @Transactional(readOnly = true)
    public List<BookingDTO> getBookingsForCarwash(Long carwashProfileId) {
        logger.info("Fetching bookings for carwash profile ID: {}", carwashProfileId);
        List<Booking> bookings = bookingRepository.findByCarwashId(carwashProfileId);

        return bookings.stream()
                .map(bookingMapper::toDTOFromBooking) // Sử dụng method reference
                .collect(Collectors.toList());
    }
    // --- Helper Method (mapToBookingServiceDTO) - Make sure it's public or accessible ---
    // Make sure this method exists and is public (as updated previously)
//    public BookingDTO mapToBookingServiceDTO(Booking booking) {
//        // Add null checks for safety, though relationships should ideally not be null
//        Schedule schedule = booking.getSchedule(); //
//        UserInformation client = booking.getUserInformation(); //
//
//
//        if (schedule == null || client == null) {
//            logger.error("Booking data inconsistent for Booking ID: {}", booking.getId());
//            throw new IllegalStateException("Booking data is inconsistent: missing schedule or client reference.");
//        }
//
//        CarwashProfile carwash = booking.getCarwash(); // Get CarwashProfile
//        if (carwash == null) {
//            logger.error("Booking data inconsistent for Booking ID: {}: missing carwash reference.", booking.getId());
//            // Decide how to handle this - throw error or maybe return DTO without carwashId?
//            // For now, let's throw an error, as a booking should have a carwash.
//            throw new IllegalStateException("Booking data is inconsistent: missing carwash reference.");
//        }
//
//
//        BookingDTO dto = new BookingDTO();
//
//        // Booking info
//        dto.setBookingId(booking.getId());
//        dto.setStatus(booking.getStatus());
//        dto.setNotes(booking.getNotes());
//        // Schedule info
//        dto.setScheduleId(schedule.getId());
//
//        // User info
//        dto.setClientId(client.getId());
//
//        // Carwash info
//        dto.setCarwashId(carwash.getId()); // Map the carwash ID from the CarwashProfile
//
//        // Product info
//        dto.setProductId(booking.getProduct().getId()); // Make sure this mapping is included if needed
////        dto.setStartTime(booking.getSchedule().getAvailableFrom());
//        if(booking.getUserInformation().getAccount()!=null) {
//        	dto.setClientGmail(booking.getUserInformation().getEmail());
//            	
//        }
//        dto.setProductName(booking.getProduct().getName());
//        return dto;
//    }

	public long countBooking() {
		return bookingRepository.count();
	}
//	public Map<Long, Map<String, Object>> groupBookingsByProductMaster(Long carwashId) {
//	    // Fetch bookings by carwashId from the database
//	    List<Booking> bookings = bookingRepository.findByCarwashId(carwashId);
//
//	    // Group non-cancelled bookings by ProductMaster id and map to BookingDTO
//	    Map<Long, List<BookingDTO>> groupByProductMaster = bookings.stream()
//	        .filter(b -> b.getProduct() != null 
//	            && b.getProduct().getProductMaster() != null 
//	            && !(b.getStatus() == BookingStatus.CANCEL)) // Exclude "cancel" status
//	        .collect(Collectors.groupingBy(
//	            b -> b.getProduct().getProductMaster().getId(),
//	            Collectors.mapping(this::mapToBookingServiceDTO, Collectors.toList())
//	        ));
//
//	    // Transform grouped bookings into result map with ProductMaster name
//	    Map<Long, Map<String, Object>> result = new HashMap<>();
//	    groupByProductMaster.forEach((productMasterId, bookingDTOs) -> {
//	        // Get ProductMaster name by ID
//	        String productMasterName = productMasterService.findById(productMasterId)
//	            .map(ProductMaster::getName)
//	            .orElse("Unknown");
//
//	        // Create product master data map
//	        Map<String, Object> productMasterData = new HashMap<>();
//	        productMasterData.put("name", productMasterName);
//	        productMasterData.put("bookings", bookingDTOs);
//
//	        result.put(productMasterId, productMasterData);
//	    });
//
//	    return result;
//	}

	public List<MonthlyRevenueDTO> getMonthlyRevenue(int year) {
	    List<Object[]> result = bookingRepository.getMonthlyRevenueByYear(year);
	    return result.stream()
	        .map(obj -> {
	            // Extract and convert the month (BigDecimal to int)
	            int month = ((BigDecimal) obj[0]).intValue();
	            
	            // Extract and convert the total revenue (BigDecimal to double)
	            double totalRevenue = ((BigDecimal) obj[1]).doubleValue();
	            
	            return new MonthlyRevenueDTO(month, totalRevenue);
	        })
	        .collect(Collectors.toList());
	}


    public List<MonthlyRevenueDTO> getMonthlyRevenueByCarwash(Long carwashId, int year) {
        List<Object[]> result = bookingRepository.getMonthlyRevenueByYearByCarWash(carwashId, year);
        return result.stream()
                .map(obj -> {
                    // obj[0] is month (1–12)
                    int month = ((BigDecimal) obj[0]).intValue();
                    // obj[1] is total Revenue
                    double totalRevenue = ((BigDecimal) obj[1]).doubleValue();
                    return new MonthlyRevenueDTO(month, totalRevenue);
                })
                .collect(Collectors.toList());
    }

    public long countBookingCarwash(Long carwashId) {
        return bookingRepository.countByCarwash(carwashId);
    }

    public long countTodayBookingsByCarwash(Long carwashId) {
        LocalDate today = LocalDate.now();
        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime startOfNextDay = today.plusDays(1).atStartOfDay();

        return bookingRepository.countTodayBookingByCarwash(
                carwashId, startOfDay, startOfNextDay
        );
    }

    public long countTodayBookings() {
        LocalDate today = LocalDate.now();
        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime startOfNextDay = today.plusDays(1).atStartOfDay();

        return bookingRepository.countTodayBookings(
                startOfDay, startOfNextDay
        );
    }

    public ResponseEntity<?> updateBookingManager(Long CarwashId,Long bookingId, BookingUpdateRequestDTO requestDto) {
        try {
            Booking booking = findById(bookingId); 
            if(booking.getCarwash().getId() !=CarwashId) {
            	return ResponseEntity.badRequest().body("You can not change booking of another Carwash");
            }
            
            
            if (requestDto.getStatus() != null) {
                try {
                    BookingStatus status = BookingStatus.valueOf(requestDto.getStatus().toUpperCase());
                    booking.setStatus(status);
                } catch (IllegalArgumentException e) {
                    return ResponseEntity.badRequest().body("Invalid booking status: " + requestDto.getStatus());
                }
            }

            if (requestDto.getNewStartTime() != null) {
                booking.setStartTime(requestDto.getNewStartTime());
            }

            if (requestDto.getNewEndTime() != null) {
                booking.setEndTime(requestDto.getNewEndTime());
            }

            bookingRepository.save(booking);

            return ResponseEntity.ok("Booking updated successfully.");

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                 .body("Error updating booking: " + e.getMessage());
        }
    }


 }

