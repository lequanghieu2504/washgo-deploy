package com.example.washgo.controller;

import com.example.washgo.dtos.ProductMasterDTO;
import com.example.washgo.model.ProductMaster; // Needed for @RequestBody
import com.example.washgo.service.ProductMasterService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
// Removed duplicate import for ProductMasterDTO

/**
 * REST Controller for managing ProductMaster templates (typically by Admins).
 * ProductMaster represents a general type of service.
 */
@RestController
@RequestMapping("/api/product-master") // Endpoint for managing templates
public class ProductMasterController {

    private final ProductMasterService productMasterService;

    public ProductMasterController(ProductMasterService productMasterService) {
        this.productMasterService = productMasterService;
    }

    /**
     * Creates a new ProductMaster template. Requires ADMIN role.
     * @param pm ProductMaster data from the request body.
     * @return The created ProductMasterDTO.
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductMasterDTO> create(@RequestBody ProductMaster pm) {
        // Service method creates the template and returns its DTO representation
        ProductMasterDTO created = productMasterService.createTemplate(pm);
        // Return 201 Created status ideally, but OK is fine too
        return ResponseEntity.ok(created);
    }

    /**
     * Retrieves a list of all ProductMaster templates.
     * Consider if this should be public or require authentication.
     * @return A list of all ProductMasterDTOs.
     */
    @GetMapping("/getAll")
    // @PreAuthorize("isAuthenticated()") // Uncomment if authentication is required
    public ResponseEntity<List<ProductMasterDTO>> getAll() {
        // Service method retrieves all templates and returns them as DTOs
        return ResponseEntity.ok(productMasterService.findAllTemplates());
    }

    /**
     * Retrieves a specific ProductMaster template by its ID.
     * Consider if this should be public or require authentication.
     * @param id The ID of the ProductMaster template.
     * @return The ProductMasterDTO if found, otherwise 404 Not Found (handled by service).
     */
    @GetMapping("/{id}")
    // @PreAuthorize("isAuthenticated()") // Uncomment if authentication is required
    public ResponseEntity<ProductMasterDTO> getById(@PathVariable Long id) {
        // Service method finds the template by ID and returns its DTO representation
        return ResponseEntity.ok(productMasterService.findProductMasterDTOById(id));
    }

    /**
     * Updates an existing ProductMaster template. Requires ADMIN role.
     * @param id The ID of the template to update.
     * @param pm ProductMaster data with updated fields from the request body.
     * @return The updated ProductMasterDTO.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductMasterDTO> update(@PathVariable Long id, @RequestBody ProductMaster pm) {
        // Service method updates the template and returns its updated DTO representation
        ProductMasterDTO updated = productMasterService.update(id, pm);
        return ResponseEntity.ok(updated);
    }

    /**
     * Deletes a ProductMaster template. Requires ADMIN role.
     * Will fail if the template is linked to any existing Product offerings.
     * @param id The ID of the template to delete.
     * @return A success message.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        productMasterService.delete(id);
        return ResponseEntity.ok("ProductMaster template deleted Successfully");
    }

    /*
    // Search endpoint - Requires corresponding service/repository logic
    // Consider if search should be admin-only or public.
    @GetMapping("/search")
    // @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ProductMasterDTO>> search(@RequestParam String name) {
        // Example: return ResponseEntity.ok(productMasterService.searchTemplatesByName(name));
        throw new UnsupportedOperationException("Search endpoint not fully implemented.");
    }
    */
}