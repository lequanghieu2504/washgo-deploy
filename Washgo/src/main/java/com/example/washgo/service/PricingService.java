package com.example.washgo.service;

import com.example.washgo.model.Pricing;
import com.example.washgo.model.Product;
import com.example.washgo.repository.PricingRepository;
import com.example.washgo.repository.ProductRepository;

// Removed unused ProductRepository import
// Removed unused ScheduleRepository import
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // Import Transactional

import java.util.NoSuchElementException;
import java.util.Optional;

@Service
public class PricingService {

    private final PricingRepository pricingRepository;
    private final ProductRepository productRepository;

    public PricingService(ProductRepository productRepository, PricingRepository pricingRepository) {
        this.productRepository = productRepository;
        this.pricingRepository = pricingRepository;
    }

    // ✅ Add Pricing to Product
    @Transactional // Add Transactional
    public Pricing addPricing(Long productId, Pricing pricing) {
        // Use ProductService to find product (might include auth checks later)
    	Optional<Product> productOptional = productRepository.findById(productId);
    	Product product = productOptional.orElseThrow(() -> new RuntimeException("Product not found when create pricing"));

        if (pricing.getPrice() == 0 || pricing.getPrice() <= 0) {
            throw new IllegalArgumentException("Price must be positive.");
        }

        if (pricing.getCurrency() == null || pricing.getCurrency().isBlank()) {
            throw new IllegalArgumentException("Currency is required.");
        }

        pricing.setProduct(product);
        Pricing saved =   pricingRepository.save(pricing);
        product.setPricing(pricing);

        return saved;
    }

    // ✅ Update Pricing
    @Transactional // Add Transactional
    public Pricing updatePricing(Long pricingId, Pricing updated) {
        Pricing existing = pricingRepository.findById(pricingId)
                .orElseThrow(() -> new NoSuchElementException("Pricing not found"));

        if (updated.getPrice() == 0 || updated.getPrice() <= 0) {
            throw new IllegalArgumentException("Price must be positive.");
        }

        if (updated.getCurrency() == null || updated.getCurrency().isBlank()) {
            throw new IllegalArgumentException("Currency is required.");
        }

        // Optional Edge: Prevent if active bookings exist for the associated product
        // Assumes ScheduleService has the method hasActiveBookings
//        boolean hasActiveBookings = scheduleService.hasActiveBookings(existing.getProduct());

//        if (hasActiveBookings) {
//            throw new IllegalStateException("Cannot adjust pricing while active bookings exist for this product.");
//        }

        existing.setPrice(updated.getPrice());
        existing.setCurrency(updated.getCurrency());

        return pricingRepository.save(existing);
    }

    // ✅ Delete Pricing
    @Transactional // Add Transactional
    public void deletePricing(Long pricingId) {
        Pricing pricing = pricingRepository.findById(pricingId)
                .orElseThrow(() -> new NoSuchElementException("Pricing not found"));

        // Optional: Could check if it's referenced elsewhere (audit logs, orders, etc.) before deleting
        // Also, ensure that deleting pricing doesn't break existing non-active bookings if needed.
        pricingRepository.delete(pricing);
    }

    public Pricing findById(Long productId) {
        return pricingRepository.findByProductId(productId)
                .orElseThrow(() -> new RuntimeException("Pricing not found with id: " + productId));
    }
}
// Removed duplicate package com.example.washgo.service;