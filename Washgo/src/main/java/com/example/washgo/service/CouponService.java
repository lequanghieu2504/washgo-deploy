package com.example.washgo.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.washgo.dtos.BookingDTO;
import com.example.washgo.dtos.CouponDTO;
import com.example.washgo.model.ClientProfile;
import com.example.washgo.model.Coupon;
import com.example.washgo.enums.DiscountType;
import com.example.washgo.repository.CouponRepository;
@Service
public class CouponService {
	private UserRegistrationService userRegistrationService;
	private CouponRepository couponRepository;
  
	public CouponService(UserRegistrationService userRegistrationService, CouponRepository couponRepository) {
        this.userRegistrationService = userRegistrationService;
        this.couponRepository = couponRepository;
    }

	public Coupon createCoupon(CouponDTO dto) {
	
		Coupon coupon = new Coupon();

	if(dto.getCarwash_id() != null) {
		coupon.setCarwas(userRegistrationService.findCarWashById(dto.getCarwash_id()));	
		}

		coupon.setName(dto.getName());
		coupon.setDiscountType(DiscountType.valueOf(dto.getDiscountType()));
		coupon.setActive(true);
		coupon.setStartedDay(dto.getStartedDay());
		coupon.setDiscount_value(dto.getDiscount_value());
		coupon.setEndDate(dto.getEndDate());
		if(dto.getClient_id() != null) {					
		coupon.setClient_id(dto.getClient_id());
		}
		return couponRepository.save(coupon);
	}
	public Coupon findById(Long id) {
	    return couponRepository.findById(id)
	            .orElseThrow(() -> new RuntimeException("Coupon not found with id: " + id));
	}



//	    public boolean addCouponToClient( CouponDTO coupon,Long clientId) {
//	        // Tìm các coupon của carwash
//	        List<Coupon> list_Coupons = couponRepository.findAllByCarwas_Id(CarwashId);
//
//	        // Kiểm tra xem có tìm thấy coupon không
//	        if (list_Coupons.isEmpty()) {
//	            throw new CouponNotFoundException("Cannot find any coupons for carwash ID: " + CarwashId);
//	        } else {
//	            Coupon temp_Coupon = null;
//
//	            // Duyệt qua danh sách coupon và tìm coupon có loại discountType
//	            for (Coupon coupon : list_Coupons) {
//	                if (coupon.getDiscountType().equals(discountType)) {
//	                    temp_Coupon = coupon;
//	                    break;
//	                }
//	            }
//
//	            // Nếu tìm thấy coupon thì gán cho client
//	            if (temp_Coupon != null) {
//	                temp_Coupon.setClient(userRegistrationService.findClientById(ClientId));
//	                System.out.println("Added coupon successfully.");
//	            } else {
//	                // Nếu không tìm thấy coupon với discountType, ném exception
//	                throw new CouponNotFoundException("Cannot find coupon with discount type: " + discountType);
//	            }
//	        }
//			return true;
//	    }
//	
	

//	public class CouponNotFoundException extends RuntimeException {
//	    /**
//		 * 
//		 */
//		private static final long serialVersionUID = 1L;
//
//		public CouponNotFoundException(String message) {
//	        super(message);
//	    }
//	}
//	 // Trong phương thức của CouponService hoặc BookingService
//
//    public List<String> getDiscountTypesForCarwash(Long carwashId) {
//        // Lấy danh sách coupon từ repository theo carwashId
//        List<Coupon> coupons = couponRepository.findAllByCarwas_Id(carwashId);
//
//        // Kiểm tra nếu không có coupon nào
//        if (coupons.isEmpty()) {
//            throw new RuntimeException("No coupons found for carwash with ID: " + carwashId);
//        }
//
//        // Trích xuất DiscountType từ danh sách coupon và tạo thành danh sách các DiscountType
//        List<String> discountTypes = coupons.stream()
//                .map(coupon -> coupon.getDiscountType().name())  // Trả về tên của DiscountType dưới dạng String
//                .collect(Collectors.toList());
//
//        return discountTypes;
//    }
	public void createNewCouponForClientHave5PointInTemp(BookingDTO dto) {
			CouponDTO couponDTO = new CouponDTO();
			couponDTO.setName("Service Coupon");
			couponDTO.setClient_id(dto.getUserId());
			couponDTO.setCarwash_id(dto.getCarwashId());
			couponDTO.setDiscount_value(0);
			couponDTO.setDiscountType("FREE_SERVICE");
			couponDTO.setStartedDay(LocalDateTime.now());
			couponDTO.setEndDate(LocalDateTime.now().plusDays(10));
			createCoupon(couponDTO);
	}
	public List<Coupon> getCouponsByClientId(Long clientId) {
        ClientProfile clientProfile = new ClientProfile();
        clientProfile = userRegistrationService.findClientById(clientId);
        return clientProfile.getListCoupons(); 
   }
	    

	

	

	}

