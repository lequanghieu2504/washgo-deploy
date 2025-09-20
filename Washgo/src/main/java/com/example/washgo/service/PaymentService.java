package com.example.washgo.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.NoSuchElementException; // Import NoSuchElementException
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // Import Transactional

import com.example.washgo.dtos.DailyRevenueDTO;
import com.example.washgo.dtos.MonthlyRevenueDTO;
import com.example.washgo.enums.BookingStatus;
import com.example.washgo.model.Booking; // Import Booking
import com.example.washgo.model.Coupon;
import com.example.washgo.enums.DiscountType;
import com.example.washgo.model.Payment;
import com.example.washgo.repository.BookingRepository; // Import BookingRepository
import com.example.washgo.repository.PaymentRepository;
import com.example.washgo.repository.PricingRepository;
import com.stripe.model.PaymentIntent;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j; // Import Slf4j for logging

@Service
@RequiredArgsConstructor
@Slf4j // Add SLF4J logging
public class PaymentService {

    private final PricingRepository pricingRepository;
    private final BookingRepository bookingRepository; // Inject BookingRepository
    private final PaymentRepository paymentRepository;
    private final ProductService productService;
    private final CouponService couponService;
    // Define constants for booking statuses
    private static final String BOOKING_STATUS_PAID = "PAID"; // Or CONFIRMED, PENDING_SERVICE etc.
    private static final String BOOKING_STATUS_FAILED = "PAYMENT_FAILED";
    private static final String BOOKING_STATUS_PENDING_PAYMENT = "PENDING_PAYMENT"; // Initial status after booking before payment

//    @Transactional // Make transactional
//    public PaymentIntent createPaymentIntent(PaymentDTO paymentDTO) throws Exception {
//        List<Pricing> pricings = pricingRepository.findAllById(paymentDTO.getPricingIds());
//
//        if (pricings.isEmpty()) {
//            throw new Exception("Cannot find pricing details for the provided IDs.");
//        }
//
//        // --- Validation for Booking ID ---
//        if (paymentDTO.getBookingId() == null) {
//            throw new IllegalArgumentException("Booking ID is required to create a payment intent.");
//        }
//        // Optional: Check if the booking actually exists and is in a state ready for payment
//        Booking booking = bookingRepository.findById(paymentDTO.getBookingId())
//                .orElseThrow(() -> new NoSuchElementException("Booking not found with ID: " + paymentDTO.getBookingId()));
//
//        // Optional: Check if booking status allows payment (e.g., it's PENDING_PAYMENT)
//        if (!BOOKING_STATUS_PENDING_PAYMENT.equalsIgnoreCase(booking.getStatus())) {
//            log.warn("Attempted to create payment intent for booking {} with status {} (expected {})",
//                    booking.getId(), booking.getStatus(), BOOKING_STATUS_PENDING_PAYMENT);
//            throw new IllegalStateException("Booking is not in a state where payment can be initiated.");
//        }
//        // --- End Validation ---
//
//
//        String currency = pricings.get(0).getCurrency();
//        boolean sameCurrency = pricings.stream()
//                .allMatch(p -> p.getCurrency().equalsIgnoreCase(currency));
//
//        if (!sameCurrency) {
//            throw new Exception("All selected pricing options must have the same currency.");
//        }
//
//        // Ensure total is calculated correctly (Stripe expects amount in cents/smallest unit)
////        long totalAmountInSmallestUnit = pricings.stream()
////                .mapToLong(Pricing::getPrice) // Assuming getPrice() returns the value in the smallest unit (e.g., cents)
////                .sum();
//
////        if (totalAmountInSmallestUnit <= 0) {
////            throw new IllegalArgumentException("Total payment amount must be positive.");
////        }
//
//        // --- Add Metadata ---
//        Map<String, String> metadata = new HashMap<>();
//        metadata.put("booking_id", paymentDTO.getBookingId().toString());
//        metadata.put("customer_email", paymentDTO.getCustomerEmail() != null ? paymentDTO.getCustomerEmail() : "N/A");
//        // Add any other relevant info, e.g., comma-separated pricing IDs
//        // metadata.put("pricing_ids", paymentDTO.getPricingIds().stream().map(Object::toString).collect(Collectors.joining(",")));
//        // ---
//
//        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
//                .setAmount(totalAmountInSmallestUnit) // Use the calculated total
//                .setCurrency(currency.toLowerCase()) // Use lowercase currency code
//                .setDescription(paymentDTO.getDescription())
//                .setReceiptEmail(paymentDTO.getCustomerEmail())
//                .putAllMetadata(metadata) // Add the metadata map
//                // Add payment method types if needed (e.g., card)
//                // .addPaymentMethodType("card")
//                .build();
//
//
//        PaymentIntent intent = PaymentIntent.create(params);
//
//        // Optional: Store the paymentIntentId in the booking record immediately?
//        // booking.setPaymentIntentId(intent.getId());
//        // bookingRepository.save(booking);
//
//        log.info("Created PaymentIntent {} for booking {}", intent.getId(), paymentDTO.getBookingId());
//        return intent;
//    }

    /**
     * Handles logic for a successful payment notification from Stripe webhook.
     * Expected to be called when a 'payment_intent.succeeded' event is received.
     *
     * @param paymentIntent The successful PaymentIntent object from Stripe.
     */
    @Transactional // Make transactional
    public void handlePaymentSuccess(PaymentIntent paymentIntent) {
        log.info("Processing successful payment webhook for PaymentIntent: {}", paymentIntent.getId());
        String bookingIdStr = paymentIntent.getMetadata().get("booking_id");

        if (bookingIdStr == null) {
            log.error("Webhook error: Missing 'booking_id' in metadata for succeeded PaymentIntent {}", paymentIntent.getId());
            // Potentially raise an alert or log for manual investigation
            return;
        }

        try {
            Long bookingId = Long.parseLong(bookingIdStr);
            Booking booking = bookingRepository.findById(bookingId)
                    .orElseThrow(() -> new NoSuchElementException("Booking not found with ID: " + bookingId + " for PaymentIntent " + paymentIntent.getId()));

            // Idempotency check: Only update if status is not already PAID
            if (!(BookingStatus.PAID == (booking.getStatus()))) {
                booking.setStatus(BookingStatus.PAID);
                // Optional: Store the successful PaymentIntent ID if not already stored
                // booking.setPaymentIntentId(paymentIntent.getId());
                booking.setUpdatedAt(java.time.LocalDateTime.now()); // Update timestamp
                bookingRepository.save(booking);
                log.info("Updated booking {} status to {} based on PaymentIntent {}", bookingId, BOOKING_STATUS_PAID, paymentIntent.getId());

                // TODO: Add any further success actions (e.g., send confirmation email, notify car wash)

            } else {
                log.warn("Received duplicate success webhook or booking {} already marked as paid for PaymentIntent {}", bookingId, paymentIntent.getId());
            }

        } catch (NumberFormatException e) {
            log.error("Webhook error: Invalid 'booking_id' format ('{}') in metadata for PaymentIntent {}", bookingIdStr, paymentIntent.getId());
        } catch (NoSuchElementException e) {
            log.error("Webhook error: {}", e.getMessage()); // Booking not found log
        } catch (Exception e) {
            log.error("Webhook error: Unexpected error processing successful payment for PaymentIntent {}", paymentIntent.getId(), e);
            // Rethrow or handle appropriately depending on whether Stripe should retry
        }
    }

    /**
     * Handles logic for a failed payment notification from Stripe webhook.
     * Expected to be called when a 'payment_intent.payment_failed' event is received.
     *
     * @param paymentIntent The failed PaymentIntent object from Stripe.
     */
    @Transactional // Make transactional
    public void handlePaymentFailure(PaymentIntent paymentIntent) {
        log.info("Processing failed payment webhook for PaymentIntent: {}", paymentIntent.getId());
        String bookingIdStr = paymentIntent.getMetadata().get("booking_id");

        if (bookingIdStr == null) {
            log.error("Webhook error: Missing 'booking_id' in metadata for failed PaymentIntent {}", paymentIntent.getId());
            return;
        }

        try {
            Long bookingId = Long.parseLong(bookingIdStr);
            Booking booking = bookingRepository.findById(bookingId)
                    .orElseThrow(() -> new NoSuchElementException("Booking not found with ID: " + bookingId + " for PaymentIntent " + paymentIntent.getId()));

            // Only update if status is not already failed or paid (avoid overwriting success)
            if (!(BookingStatus.FAIL == (booking.getStatus())) && !(BookingStatus.PAID  == (booking.getStatus()))) {
                booking.setStatus(BookingStatus.FAIL);
                booking.setUpdatedAt(java.time.LocalDateTime.now());
                // booking.setPaymentIntentId(paymentIntent.getId()); // Store failing intent ID?
                bookingRepository.save(booking);
                log.info("Updated booking {} status to {} based on failed PaymentIntent {}", bookingId, BOOKING_STATUS_FAILED, paymentIntent.getId());

                // TODO: Add failure actions (e.g., notify user, suggest retrying payment)

            } else {
                log.warn("Received payment failure webhook for booking {} which is already in status {} for PaymentIntent {}", bookingId, booking.getStatus(), paymentIntent.getId());
            }

        } catch (NumberFormatException e) {
            log.error("Webhook error: Invalid 'booking_id' format ('{}') in metadata for PaymentIntent {}", bookingIdStr, paymentIntent.getId());
        } catch (NoSuchElementException e) {
            log.error("Webhook error: {}", e.getMessage());
        } catch (Exception e) {
            log.error("Webhook error: Unexpected error processing failed payment for PaymentIntent {}", paymentIntent.getId(), e);
        }
    }
    
    
    
    public void savePayment(Payment payment) {
    	paymentRepository.save(payment);
    }
    public List<MonthlyRevenueDTO> getMonthlyRevenueFromPayment(int year) {
        List<Object[]> result = paymentRepository.getMonthlyRevenue(year);
        return result.stream()
            .map(obj -> {
                int month = ((Number) obj[0]).intValue();
                double totalRevenue = ((Number) obj[1]).doubleValue();
                return new MonthlyRevenueDTO(month, totalRevenue);
            })
            .collect(Collectors.toList());
    }
    public List<DailyRevenueDTO> getDailyRevenue(int year, int month) {
        List<Object[]> rawData = paymentRepository.getDailyRevenueByMonth(year, month);

        return rawData.stream()
                .map(obj -> {
                    java.sql.Date sqlDate = (java.sql.Date) obj[0];
                    LocalDate day = sqlDate.toLocalDate();

                    Double totalRevenue = ((Number) obj[1]).doubleValue();

                    return new DailyRevenueDTO(day, totalRevenue);
                })
                .collect(Collectors.toList());
    }


        public List<MonthlyRevenueDTO> getMonthlyRevenueFromPaymentByCarwash(Long carwashId, int year) {
            List<Object[]> result = paymentRepository.getMonthlyRevenueByCarwash(carwashId, year);
            return result.stream()
                    .map(obj -> {
                        int month = ((Number) obj[0]).intValue();
                        double totalRevenue = ((Number) obj[1]).doubleValue();
                        return new MonthlyRevenueDTO(month, totalRevenue);
                    })
                    .collect(Collectors.toList());
        }

    public List<DailyRevenueDTO> getDailyRevenueByCarwash(Long carwashId, int year, int month) {
        List<Object[]> rawData = paymentRepository.getDailyRevenueByCarwash(carwashId, year, month);
        return rawData.stream()
                .map(obj -> {
                    java.sql.Date sqlDate = (java.sql.Date) obj[0];
                    LocalDate day         = sqlDate.toLocalDate();
                    double totalRevenue   = ((Number) obj[1]).doubleValue();
                    return new DailyRevenueDTO(day, totalRevenue);
                })
                .collect(Collectors.toList());
    }

    public BigDecimal getTotalRevenueByCarwash(Long carwashId) {
        return paymentRepository.sumPaidByCarwash(carwashId);
    }

    public BigDecimal getTotalRevenueAll() {
        return paymentRepository.sumAllPaid();
    }

//	public void createPayment(BookingDTO dto,Booking booking) {
//		List<Product> product = booking.getProducts();
//		Payment payment = new Payment();
//	
//		payment.setBooking(booking);
//		payment.setCarwashProfile(booking.getCarwash());
//		payment.setCreatedAt(LocalDateTime.now());
//		payment.setUpdatedAt(LocalDateTime.now());
//		
//		if(dto.getCouponId() != null) {
//			payment.setPrice(calculateFinalPrice(product.getPricing().getPrice(), couponService.findById(dto.getCouponId())));
//		}
//		else {
//			payment.setPrice(product.getPricing().getPrice());
//		}
//		savePayment(payment);
//	}

	private Double calculateFinalPrice(double price, Coupon coupon) {
		  // Tính giá cuối cùng
		double originalPrice = price; // đơn vị nhỏ nhất, ví dụ cents
        double finalPrice = originalPrice;
        System.out.println(originalPrice);
        if (coupon != null && coupon.getDiscountType() != null) {
            Long discount = coupon.getDiscount_value();
            DiscountType type = DiscountType.valueOf(coupon.getDiscountType().name());

            switch (type) {
                case PERCENTAGE:
                    finalPrice = originalPrice - (originalPrice * discount / 100.0);
                    System.out.println(discount);
                    break;
                case FIXED_AMOUNT:
                    finalPrice = originalPrice - discount;
                    break;
                case BUY_ONE_GET_ONE:
                case FREE_SERVICE:
                    finalPrice = 0.0; // hoặc xử lý riêng tùy chính sách
                    break;
            }
            System.out.println(finalPrice);
            // Đảm bảo không bị âm
            if (finalPrice < 0) {
                finalPrice = 0.0;
            }
        }

		return finalPrice;
	}

	public Payment findByBookingId(Long id) {
	    Payment payment = paymentRepository.findByBookingId(id);
	    if (payment == null) {
	        throw new EntityNotFoundException("can not find Payment with BookingId = " + id);
	    }
	    return payment;
	}
	public void deleteByBookingId(Long id) {
		paymentRepository.deleteByBookingId(id);
	}

}
