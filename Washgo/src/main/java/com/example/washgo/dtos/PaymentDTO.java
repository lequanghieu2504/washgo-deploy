package com.example.washgo.dtos;

import java.util.List;

import lombok.Data;

@Data
	public class PaymentDTO {
	    private List<Long> pricingIds; // Danh sách ID các Pricing được chọn
	    private String customerEmail;  // Email khách hàng (nếu cần gửi hóa đơn)
	    private String description;    // Ghi chú đơn hàng
		private Long bookingId;
		private Long CouponId;
		private Long carwashId;
	}

