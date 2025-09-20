package com.example.washgo.dtos;

import java.time.LocalDateTime;
import java.util.List;
import lombok.Data;
@Data
public class BookingResponseForClientDTO {
    private Long bookingId;
    private String notes;

    private LocalDateTime startTime;
    private LocalDateTime endTime;

//    private List<Long> productsId;

//    private Long userId;
    private Long carwashId;

    private String carwashName;

//    private PaymentDTO payment;
//
//    private Long couponId;

//    private String phoneNumber;

    private List<ProductDTO> listProductDTO;

    private String status;

    private boolean isFeedbacked;

}
