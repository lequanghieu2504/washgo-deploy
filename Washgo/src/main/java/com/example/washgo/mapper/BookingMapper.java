package com.example.washgo.mapper;

import java.util.ArrayList;
import java.util.List;

import com.example.washgo.dtos.BookingResponseForClientDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.example.washgo.dtos.BookingDTO;
import com.example.washgo.dtos.BookingResponseDTO;
import com.example.washgo.enums.BookingStatus;
import com.example.washgo.model.Booking;
import com.example.washgo.model.Product;

@Component
public class BookingMapper {
	@Autowired
    private ProductMapper productMapper;

    @Autowired
    private FeedbackMapper feedbackMapper;

    public BookingDTO toDTOFromBooking(Booking booking) {
        if (booking == null) return null;

        BookingDTO dto = new BookingDTO();

        dto.setNotes(booking.getNotes());

        dto.setBookingId(booking.getId());

        dto.setStartTime(booking.getStartTime());
        dto.setEndTime(booking.getEndTime());

        // Map products
        if (booking.getProducts() != null) {
            dto.setListProductDTO(productMapper.toProductDTOList(booking.getProducts()));
        }

        // Map IDs
        if (booking.getUserInformation() != null) {
            dto.setUserId(booking.getUserInformation().getId());
        }
        if (booking.getCarwash() != null) {
            dto.setCarwashId(booking.getCarwash().getId());
        }
        if (booking.getSelectedCoupon() != null) {
            dto.setCouponId(booking.getSelectedCoupon().getId());
        }
    	List<Long> productIds = new ArrayList<Long>();
        if((!booking.getProducts().isEmpty() || booking.getProducts()!= null)) {
        List<Product> listProductOfBooking = booking.getProducts();
        for(Product p : listProductOfBooking) {
        	productIds.add(p.getId());
        }
        }
        if(productIds!=null||!(productIds.isEmpty())){
        dto.setProductsId(productIds);
        }
        if(booking.getUserInformation().getPhoneNumber()!=null) {
        	dto.setPhoneNumber(booking.getUserInformation().getPhoneNumber());
        }
        
        if(booking.getStatus()!=null) {
        	dto.setStatus(booking.getStatus().toString());
        }
//        // Map payment
//        if (booking.getPayment() != null) {
//            dto.setPayment(paymentMapper.toDTO(booking.getPayment()));
//        }
//
//        // Map feedbacks
//        if (booking.getFeedbacks() != null) {
//            dto.setFeedbacks(feedbackMapper.toDTOList(booking.getFeedbacks()));
//        }

        return dto;
    }

    public BookingResponseForClientDTO toBookingResponseToClientDTOFromBooking(Booking booking) {
        if (booking == null) return null;

        BookingResponseForClientDTO dto = new BookingResponseForClientDTO();

        dto.setNotes(booking.getNotes());

        dto.setBookingId(booking.getId());

        dto.setCarwashId(booking.getCarwash().getId());

        dto.setCarwashName(booking.getCarwash().getCarwashName());

        dto.setStartTime(booking.getStartTime());
        dto.setEndTime(booking.getEndTime());

        dto.setFeedbacked(booking.getFeedbacks() != null && !booking.getFeedbacks().isEmpty());

        // Map products
        if (booking.getProducts() != null) {
            dto.setListProductDTO(productMapper.toProductDTOList(booking.getProducts()));
        }


        List<Long> productIds = new ArrayList<Long>();
        if((!booking.getProducts().isEmpty() || booking.getProducts()!= null)) {
            List<Product> listProductOfBooking = booking.getProducts();
            for(Product p : listProductOfBooking) {
                productIds.add(p.getId());
            }
        }


        if(booking.getStatus()!=null) {
            dto.setStatus(booking.getStatus().toString());
        }
//        // Map payment
//        if (booking.getPayment() != null) {
//            dto.setPayment(paymentMapper.toDTO(booking.getPayment()));
//        }
//
//        // Map feedbacks
//        if (booking.getFeedbacks() != null) {
//            dto.setFeedbacks(feedbackMapper.toDTOList(booking.getFeedbacks()));
//        }

        return dto;
    }

    // Optional: Chuyển ngược từ DTO sang Entity (nếu cần)
    public Booking toEntityFromDTO(BookingDTO dto) {
        if (dto == null) return null;

        Booking booking = new Booking();
   
        booking.setNotes(dto.getNotes());
  
        booking.setStartTime(dto.getStartTime());
        booking.setEndTime(dto.getEndTime());

        // Các phần còn lại (set user, carwash, coupon...) nên được xử lý trong service nếu cần fetch từ DB

        return booking;
    }

	public BookingResponseDTO toDTOFromBookingResponse(Booking booking) {

		BookingResponseDTO bookingResponseDTO = new BookingResponseDTO();
		bookingResponseDTO.setNotes(booking.getNotes());
        bookingResponseDTO.setBookingId(booking.getId());
		bookingResponseDTO.setEndTime(booking.getEndTime());
		bookingResponseDTO.setStartTime(booking.getStartTime());
		bookingResponseDTO.setFinalPrice(booking.getTotalPrice());
		bookingResponseDTO.setCurrency(booking.getCurrency());
		   if (booking.getProducts() != null) {
	            bookingResponseDTO.setListProductDTO(productMapper.toProductDTOList(booking.getProducts()));
	        }
		 bookingResponseDTO.setBookingStatus(booking.getStatus());
		return bookingResponseDTO;
	}}
