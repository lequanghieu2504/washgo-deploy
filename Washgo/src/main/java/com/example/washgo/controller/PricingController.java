package com.example.washgo.controller;

import com.example.washgo.model.Pricing;
import com.example.washgo.service.PricingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/pricing")
public class PricingController {

    private final PricingService pricingService;

    public PricingController(PricingService pricingService) {
        this.pricingService = pricingService;
    }

    // ✅ Add Pricing
    @PostMapping("/product/{productId}")
    public ResponseEntity<Pricing> addPricing(@PathVariable Long productId, @RequestBody Pricing pricing) {
        return ResponseEntity.ok(pricingService.addPricing(productId, pricing));
    }

    // ✅ Update Pricing
    @PutMapping("/{pricingId}")
    public ResponseEntity<Pricing> updatePricing(@PathVariable Long pricingId, @RequestBody Pricing pricing) {
        return ResponseEntity.ok(pricingService.updatePricing(pricingId, pricing));
    }

    // ✅ Delete Pricing
    @DeleteMapping("/{pricingId}")
    public ResponseEntity<String> deletePricing(@PathVariable Long pricingId) {
        pricingService.deletePricing(pricingId);
        return ResponseEntity.ok("Pricing deleted successfully.");
    }

}
