package com.example.washgo.controller;

import com.example.washgo.dtos.*;
import com.example.washgo.model.Product; // Input for create/update (Consider replacing with DTOs)
import com.example.washgo.model.ProductMaster;
import com.example.washgo.model.UserInformation;
import com.example.washgo.repository.UserInformationRepository;
import com.example.washgo.service.ProductService;
import jakarta.validation.Valid; // Import if using validation on a dedicated DTO
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt; // Keep this import
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.security.PublicKey;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/products") // Standard base path for product offerings
public class ProductController {

    private final ProductService productService;
    private final UserInformationRepository userRepository;

    public ProductController(ProductService productService, UserInformationRepository userRepository) {
        this.productService = productService;
        this.userRepository = userRepository;
    }

    // --- Helper Method to Get Authenticated User ID (Keep as is, but note the principal type difference) ---
    private Long getAuthenticatedUserId(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User is not authenticated");
        }
        // Get the principal name (which is the username string set by JwtAuthenticationFilter)
        String username = authentication.getName();
        if (username == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Username not found in authentication principal");
        }

        Optional<UserInformation> userOpt = userRepository.findByAccountUsername(username);
        return userOpt.map(UserInformation::getId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Authenticated user '" + username + "' not found in database"));
    }

    // --- CREATE Product Offering (POST) ---
    /**
     * Creates a new product offering based on a ProductMaster template.
     * Only accessible to authenticated CARWASH users.
     * @param productDetails Contains details like specific name, description, dates (Potentially a ProductCreateDTO).
     * @return ResponseEntity containing the created ProductDTO and HTTP status 201.
     */
    @PostMapping("/master")
    @PreAuthorize("hasRole('CARWASH')") // Only Carwash owners can create offerings
    public ResponseEntity<?> create(
            // Consider using @Valid ProductCreateDTO instead of Product entity here
            @RequestBody ProductReadDTO productDetails) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Long carwashOwnerId = getAuthenticatedUserId(authentication);
        // Service method creates the offering and returns its DTO
        ProductResponseDTO createdProductDTO = productService.createProductOffering(carwashOwnerId,productDetails);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdProductDTO);
    }

    @PostMapping("/create/subProduct")
    @PreAuthorize("hasRole('CARWASH')")
    public ResponseEntity<?> createSubProduct(@RequestBody subProductDTO productDetails) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Long carwashOwnerId = getAuthenticatedUserId(authentication);
        return productService.createSubProduct(carwashOwnerId, productDetails);
    }
    




    // --- READ All Product Offerings (GET) ---
    /**
     * Retrieves a list of ALL product offerings across all car washes.
     * Only accessible to ADMIN users.
     * @return ResponseEntity containing a list of all ProductDTOs.
     */
    @GetMapping()
    @PreAuthorize("hasRole('ADMIN')") // Only Admins can see all products from all carwashes
    public ResponseEntity<List<ProductDTO>> getAll() {
        return ResponseEntity.ok(productService.findAll());
    }

    // --- READ One Product Offering (GET by ID) ---
    /**
     * Retrieves a specific product offering by its ID.
     * Accessible to any authenticated user (can be refined).
     * @param id The ID of the Product offering to retrieve.
     * @return ResponseEntity containing the ProductDTO.
     */
    @GetMapping("getById/{id}")
    @PreAuthorize("isAuthenticated()") // Any authenticated user can view product details
    public ResponseEntity<ProductDTO> getById(@PathVariable Long id) {
        // Service method finds by ID and returns DTO
        return ResponseEntity.ok(productService.findProductDTOById(id));
    }

    // --- UPDATE Product Offering (PUT) ---
    /**
     * Updates an existing product offering.
     * Accessible to ADMINs or the CARWASH owner of the product.
     * @param id The ID of the product offering to update.
     * @param productDetails Contains the updated details (Potentially a ProductUpdateDTO).
     * @param authentication The current authentication principal.
     * @return ResponseEntity containing the updated ProductDTO.
     */
    @PutMapping("/{id}")
    // *** UPDATED @PreAuthorize expression ***
    // Admin can update any, Carwash owner can update their own by comparing usernames
    @PreAuthorize("hasRole('ADMIN') or (hasRole('CARWASH') and @productService.findById(#id).carwashOwner.username == #authentication.name)")
    public ResponseEntity<ProductDTO> update(
            @PathVariable Long id,
            // Consider using @Valid ProductUpdateDTO instead of Product entity here
            @RequestBody Product productDetails,
            Authentication authentication) {

        // Determine requesting user ID (needed by service for ownership check if not ADMIN)
        Long requestingUserId = getAuthenticatedUserId(authentication); // Get ID for the service call

        // Service method performs update (potentially checking ownership again) and returns DTO
        ProductDTO updatedProductDTO = productService.update(id, productDetails, requestingUserId);
        return ResponseEntity.ok(updatedProductDTO);
    }


    // --- DELETE Product Offering (DELETE by ID) ---
    /**
     * Deletes a specific product offering.
     * Accessible to ADMINs or the CARWASH owner of the product.
     * @param id The ID of the product offering to delete.
     * @param authentication The current authentication principal.
     * @return ResponseEntity with status 204 No Content.
     */
    @DeleteMapping("/{id}")
    // *** UPDATED @PreAuthorize expression ***
    // Admin can delete any, Carwash owner can delete their own by comparing usernames
    @PreAuthorize("hasRole('ADMIN') or (hasRole('CARWASH') and @productService.findById(#id).carwashOwner.username == #authentication.name)")
    public ResponseEntity<Void> delete(@PathVariable Long id, Authentication authentication) {
        // Determine requesting user ID for the service call
        Long requestingUserId = getAuthenticatedUserId(authentication);

        // Service method performs deletion (potentially checking ownership again)
        productService.delete(id, requestingUserId);
        return ResponseEntity.noContent().build(); // Return 204 No Content
    }
    
    @GetMapping("/carwash/{carwashId}")
    public ResponseEntity<List<ProductWithPricingDTO>> getProductsByCarwash(@PathVariable Long carwashId) {
        List<ProductWithPricingDTO> products = productService.getProductsWithPricingByCarwash(carwashId);
        return ResponseEntity.ok(products);
    }


    @GetMapping("/carwash/subproduct/{productMasterId}")
    public ResponseEntity<?> getAllSubProductWithProductMasterId(@PathVariable Long productMasterId,  Authentication authentication){

    		ResponseEntity<List<ProductDTO>>  listProduct = productService.getAllSubProductWithProductMasterId(productMasterId,authentication);
    	
    		return listProduct;
    }

//    @PostMapping("/filter")
//    public ResponseEntity<List<ProductDTO>> getAvailableProducts(
//            @RequestBody BookingRequestDTO req) {
//
//        List<ProductDTO> available = productService
//                .findAvailableProducts(req.getCategory(), req.getRequestedTime());
//
//        return ResponseEntity.ok(available);
//    }

    // Note: Endpoint to get products for a SPECIFIC carwash owner is in CarwashController
    // GET /api/carwashes/{ownerId}/products
}
