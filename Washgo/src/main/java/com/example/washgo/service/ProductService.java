// src/main/java/com/example/washgo/service/ProductService.java
package com.example.washgo.service;
import com.example.washgo.dtos.*;
import com.example.washgo.enums.BookingStatus;
import com.example.washgo.enums.UserRole; // Import UserRole
import com.example.washgo.mapper.ProductMapper; // Import Mapper
import com.example.washgo.model.CarwashProfile;
import com.example.washgo.model.Pricing;
import com.example.washgo.model.Product;
import com.example.washgo.model.ProductMaster;
import com.example.washgo.model.UserAccount;
import com.example.washgo.model.UserInformation; // Import UserInformation
import com.example.washgo.repository.CarwashProfileRepository;
import com.example.washgo.repository.ProductMasterRepository;
import com.example.washgo.repository.ProductRepository;
import com.example.washgo.repository.UserAccountRepository;
// Removed unused ScheduleRepository import
import com.example.washgo.repository.UserInformationRepository; // Import User Repo
import com.example.washgo.util.SecurityUtils;

import org.springframework.http.HttpStatus; // Import HttpStatus
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException; // For auth checks
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // Import Transactional
import org.springframework.web.server.ResponseStatusException; // Import ResponseStatusException


import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;



@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductMasterRepository productMasterRepository;
    // Removed unused ScheduleRepository field
    private final UserInformationRepository userRepository; // Inject User Repo
    private final ProductMapper productMapper; // Inject Mapper
    private final UserAccountRepository userAccountRepository;
    private final ProductMasterService productMasterService;
    private final SecurityUtils securityUtils;
    private final PricingService pricingService;
    private final CarwashProfileRepository carwashProfileRepository;


    public ProductService(CarwashProfileRepository carwashProfileRepository,PricingService pricingService,SecurityUtils securityUtils,ProductRepository productRepository,
                          ProductMasterRepository productMasterRepository,
                          // Removed unused ScheduleRepository parameter
                          UserInformationRepository userRepository, // Add User Repo
                          ProductMapper productMapper, UserAccountRepository userAccountRepository,ProductMasterService productMasterService) { // Add Mapper
        this.productRepository = productRepository;
        this.productMasterRepository = productMasterRepository;
        // Removed unused ScheduleRepository assignment
        this.userRepository = userRepository; // Assign User Repo
        this.productMapper = productMapper; // Assign Mapper
        this.productMasterService = productMasterService;
        this.userAccountRepository = userAccountRepository;
        this.securityUtils = securityUtils;
        this.pricingService = pricingService;
        this.carwashProfileRepository = carwashProfileRepository;
    }

    // --- Updated Create Method ---
    @Transactional
    public ProductResponseDTO createProductOffering(Long carwashOwnerId, ProductReadDTO productDetails) {
        if (productDetails.getProductMasterId() == null || productDetails.getTiming() == null) {
            throw new IllegalArgumentException("Missing required fields: productMasterId or timing");
        }

        // 1. Lấy Carwash Owner
        CarwashProfile owner = carwashProfileRepository.findById(carwashOwnerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Carwash owner not found"));

        if (owner.getUser().getRole() != UserRole.CARWASH) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "User is not a carwash owner");
        }

        // 2. Lấy ProductMaster
        ProductMaster master = productMasterRepository.findById(productDetails.getProductMasterId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product master not found"));

        // 3. Tạo Product
        Product newProduct = new Product();

        if (productDetails.getProductParent() != null) {
            Product parent = productRepository.findById(productDetails.getProductParent())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Parent product not found"));
            newProduct.setParent(parent);
        }

        
        
        
        newProduct.setProductMaster(master);
        newProduct.setName(productDetails.getName() != null ? productDetails.getName() : master.getName());
        newProduct.setDescription(productDetails.getDescription() != null ? productDetails.getDescription() : master.getDescription());
        newProduct.setActive(productDetails.isActive());
        newProduct.setTimeming(productDetails.getTiming());
        newProduct.setCarwashOwner(owner);

        Product saved = productRepository.save(newProduct);

        Pricing pricing = new Pricing();
        //add pricing after create product
        pricing.setCurrency(productDetails.getCurrency());
        pricing.setPrice(productDetails.getPrice());
        pricingService.addPricing(saved.getId(), pricing);

        return productMapper.toProductResponseDTO(saved);
    }


    @Transactional
    public ResponseEntity<?> createSubProduct(Long carwashOwnerId, subProductDTO productDetails) {
        try {
            // 1. Validate input parameters
            if (carwashOwnerId == null) {
                return ResponseEntity.badRequest().body("Carwash owner ID cannot be null");
            }
            if (productDetails == null) {
                return ResponseEntity.badRequest().body("Product details cannot be null");
            }

            // 2. Find and validate carwash owner
            CarwashProfile owner = carwashProfileRepository.findById(carwashOwnerId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                            "Carwash owner not found with ID: " + carwashOwnerId));
            if (owner.getUser().getAccount() == null || owner.getUser().getRole() != UserRole.CARWASH) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("User " + carwashOwnerId + " is not a carwash owner");
            }

            // 3. Validate and find parent product
            if (productDetails.getParentId() == null) {
                return ResponseEntity.badRequest().body("Parent product ID cannot be null");
            }
            Product parentProduct = productRepository.findById(productDetails.getParentId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                            "Parent product not found with ID: " + productDetails.getParentId()));

            // 4. Validate product fields
            if (productDetails.getName() == null || productDetails.getName().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Product name cannot be null or empty");
            }
            if (productDetails.getDescription() == null || productDetails.getDescription().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Product description cannot be null or empty");
            }
            if (productDetails.getTiming() == null) {
                return ResponseEntity.badRequest().body("Product timing cannot be null");
            }

            // 5. Validate product master ID
            if (productDetails.getProductMasterid() == null) {
                return ResponseEntity.badRequest().body("Product master ID cannot be null or empty");
            }

            // 6. Find ProductMaster
            Long masterId;
            try {
                masterId = Long.valueOf(productDetails.getProductMasterid());
            } catch (NumberFormatException e) {
                return ResponseEntity.badRequest().body("Invalid ProductMaster ID format");
            }

            ProductMaster productMaster = productMasterService.findById(masterId);
                    
            // 7. Create new product
            Product newProduct = new Product();
            newProduct.setProductMaster(productMaster);
            newProduct.setName(productDetails.getName());
            newProduct.setDescription(productDetails.getDescription());
            newProduct.setActive(productDetails.isActive());
            newProduct.setTimeming(productDetails.getTiming()); // hoặc setTiming
            newProduct.setCarwashOwner(owner);
            newProduct.setParent(parentProduct);

            // 8. Save and return DTO
            Product savedProduct = productRepository.save(newProduct);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(productMapper.toSubProductDTO(savedProduct));

        } catch (ResponseStatusException ex) {
            return ResponseEntity.status(ex.getStatusCode()).body(ex.getReason());
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Unexpected error occurred: " + ex.getMessage());
        }
    }


    // --- NEW METHOD ---
    @Transactional(readOnly = true)
    public List<ProductDTO> findProductsByCarwash(Long carwashOwnerId) {
        // Optional: Check if user exists first and is CARWASH role
        if (!carwashProfileRepository.existsById(carwashOwnerId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Carwash owner user not found with ID: " + carwashOwnerId);
        }
        // Fetch products associated with this owner
        List<Product> products = productRepository.findByCarwashOwnerId(carwashOwnerId);
        return productMapper.toProductDTOList(products);
    }

    // --- Update existing methods with Owner Checks ---
    // Keep internal findById returning entity for service logic
    // Find By ID (no owner check needed here, could be anyone viewing)
    public Product findById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Product offering not found with ID: " + id));
    }

    @Transactional(readOnly = true) // Make DTO conversion readOnly
    public ProductDTO findProductDTOById(Long id) {
        return productMapper.toProductDTO(findById(id));
    }

    // Find All (Maybe Admin only? Or needs context?) - Returning DTO List
    @Transactional(readOnly = true) // Make readOnly
    public List<ProductDTO> findAll() {
        return productMapper.toProductDTOList(productRepository.findAll());
    }


    @Transactional
    public ProductDTO update(Long productId, Product updatedDetails, Long requestingUserId) {
        Product existing = findById(productId);

        // Security Check: Ensure the user updating owns this product offering
        if (!existing.getCarwashOwner().getId().equals(requestingUserId)) {
            throw new AccessDeniedException("User " + requestingUserId + " does not have permission to update product offering " + productId);
        }

        // Validation for dates
        if (updatedDetails.getEffectiveFrom() != null && updatedDetails.getEffectiveTo() != null &&
                updatedDetails.getEffectiveFrom().isAfter(updatedDetails.getEffectiveTo())) {
            throw new IllegalArgumentException("Effective From date cannot be after Effective To date.");
        }

        // Update fields (only allow updating certain fields)
        existing.setName(updatedDetails.getName() != null ? updatedDetails.getName() : existing.getName());
        existing.setDescription(updatedDetails.getDescription() != null ? updatedDetails.getDescription() : existing.getDescription());
        existing.setEffectiveFrom(updatedDetails.getEffectiveFrom());
        existing.setEffectiveTo(updatedDetails.getEffectiveTo());
        existing.setActive(updatedDetails.isActive());
        // DO NOT allow changing productMaster or carwashOwner here

        Product savedProduct = productRepository.save(existing);
        return productMapper.toProductDTO(savedProduct); // Return DTO
    }


    @Transactional
    public void delete(Long productId, Long requestingUserId) {
        Product product = findById(productId);

        // Security Check: Ensure the user deleting owns this product offering
        if (!product.getCarwashOwner().getId().equals(requestingUserId)) {
            throw new AccessDeniedException("User " + requestingUserId + " does not have permission to delete product offering " + productId);
        }

        // Prevent deletion if active schedules/bookings exist
        // Note: This check might be complex depending on booking status definition

//        if (!product.getSchedules().isEmpty()) {
//            // More robust check: Check if any associated schedule has *active* bookings
//            boolean hasActiveBookings = product.getSchedules().stream()
//                    .anyMatch(schedule -> schedule.getBookings().stream()
//                            .anyMatch(booking ->  BookingStatus.ACCEPTED == (booking.getStatus()))); // Assuming "ACTIVE" status means cannot delete
//            if (hasActiveBookings) {
//                throw new IllegalStateException("Cannot delete product offering " + productId + " because it has active bookings.");
//            }
//        }

        // Note: Cascade should handle deleting associated Pricing/Schedules if configured correctly in Product entity
        productRepository.delete(product);
    }
    
    public List<ProductWithPricingDTO> getProductsWithPricingByCarwash(Long carwashId) {
        List<Product> products = productRepository.findAllWithPricingByCarwashId(carwashId);

        return products.stream()
                .map(ProductMapper::toProductWithPricingDTO) 
                .collect(Collectors.toList());
    }
	public  List<Product> toProductList(List<Long> products) {
		List<Product> resultListProduct = new ArrayList<Product>();
		
		for(Long p : products) {
			Product newProduct =findById(p);
			resultListProduct.add(newProduct);
		}
		
		return resultListProduct;
	}

	public ResponseEntity<List<ProductDTO>> getAllSubProductWithProductMasterId(Long productMasterId, Authentication authentication) {
	    try {
	        Long carwashId = securityUtils.getAuthenticatedUserId(authentication);
	        
	        if (carwashId == null) {
	            return ResponseEntity.badRequest().body(null); // Trả về lỗi 400 nếu carwashId không hợp lệ
	        }

	        List<Product> listProduct = productRepository.findAllSubProuductByProductMasterId(carwashId, productMasterId);
	        
	        if (listProduct == null || listProduct.isEmpty()) {
	            return ResponseEntity.noContent().build(); // Trả về lỗi 204 nếu không có sản phẩm nào
	        }

	        List<ProductDTO> listProductDTOs = listProduct.stream()
	                .map(product -> productMapper.toProductDTO(product)) // Mapping từng Product thành ProductDTO
	                .collect(Collectors.toList());

	        return ResponseEntity.ok(listProductDTOs);
	    } catch (Exception e) {
	  
	        return ResponseEntity.status(500).body(null);
	    }
	}

//    public List<ProductDTO> findAvailableProducts(String category, LocalDateTime at) {
//        List<Product> products = productRepository.findAvailableProductsByCategoryAndTime(category, at);
//        return products.stream()
//                .map(p -> {
//                    ProductDTO dto = new ProductDTO();
//                    dto.setId(p.getId());
//                    dto.setName(p.getName());
//                    dto.setDescription(p.getDescription());
//                    dto.setEffectiveFrom(p.getEffectiveFrom());
//                    dto.setEffectiveTo(p.getEffectiveTo());
//                    dto.setProductMasterId(p.getProductMaster().getId());
//                    dto.setProductMasterName(p.getProductMaster().getName());
//                    dto.setCarwashOwnerId(p.getCarwashOwner().getId());
//                    dto.setPricing(p.getPricing());
//
//                    // Vì đã JOIN FETCH, p.getSchedules() chỉ có những schedule match
//                    List<ScheduleSummaryDTO> scheds = p.getSchedules().stream()
//                            .map(s -> {
//                                ScheduleSummaryDTO sd = new ScheduleSummaryDTO();
//                                sd.setId(s.getId());
//                                sd.setAvailableFrom(s.getAvailableFrom());
//                                sd.setAvailableTo(s.getAvailableTo());
//                                sd.setCapacity(s.getCapacity());
//                                sd.setActiveBookingCount(s.getBookings().size());
//                                return sd;
//                            })
//                            .collect(Collectors.toList());
//
//                    dto.setSchedules(scheds);
//                    return dto;
//                })
//                .collect(Collectors.toList());
//    }

}
// Removed duplicate package com.example.washgo.service;