package com.example.washgo.controller;

import com.example.washgo.dtos.CouponDTO;
import com.example.washgo.service.CouponService;
import com.example.washgo.model.Coupon;

import java.util.List;

import org.apache.http.HttpStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/coupon")
public class CouponController {

    @Autowired
    private CouponService couponService;
    
//    // API để áp dụng coupon khi người dùng chọn DiscountType
//    @PostMapping("/apply-discount")
//    public ResponseEntity<?> applyDiscount(@RequestBody CouponDTO couponDTO) {
//        // Lấy DiscountType từ request
//        DiscountType selectedDiscountType = DiscountType.valueOf(counCouponDTO.getDiscountType());
//
//        // Áp dụng coupon cho client
//        boolean result = couponService.addCouponToClient(counCouponDTO.getCarwash_id(),counCouponDTO.getClient_id(), selectedDiscountType);
//
//        if (result) {
//            return ResponseEntity.ok("Coupon applied successfully!");
//        } else {
//            return ResponseEntity.status(HttpStatus.SC_BAD_REQUEST).body("Failed to apply coupon.");
//        }}
//    
    @PostMapping("/create")
    @PreAuthorize("hasRole('CARWASH')")
    public ResponseEntity<CouponDTO> createCoupon(@RequestBody CouponDTO couponDTO){
    	couponService.createCoupon(couponDTO);
    	return ResponseEntity.ok(couponDTO);
    }
    @GetMapping("/getAllCouponByClientId/{clientId}")
    public ResponseEntity<?> getAllCouponsByClientId(@PathVariable Long clientId) {
        try {
            List<Coupon> coupons = couponService.getCouponsByClientId(clientId);
            return ResponseEntity.ok(coupons);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.SC_NOT_FOUND).body(e.getMessage());
        }
    }
    
    //    @PostMapping("/addClient")
//    public ResponseEntity<CouponDTO> addClientToCoupon(@RequestBody CouponDTO couponDTO,Long client_id){
//    	 
//    }
}
