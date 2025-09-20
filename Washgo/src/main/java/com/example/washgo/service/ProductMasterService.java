package com.example.washgo.service;

import com.example.washgo.dtos.ProductMasterDTO;
import com.example.washgo.mapper.ProductMasterMapper;
import com.example.washgo.model.ProductMaster;
// Removed unused UserInformation import
import com.example.washgo.repository.ProductMasterRepository;
import com.example.washgo.repository.ProductRepository;
// Removed unused UserInformationRepository import
// Corrected Transactional import
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
// Removed unused HttpStatus import
import org.springframework.stereotype.Service;
// Removed unused ResponseStatusException import

import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;


/**
 * Service for managing ProductMaster templates.
 */
@Service
public class ProductMasterService {
	@Autowired
    private final ProductMasterRepository productMasterRepository;
    private final ProductRepository productRepository; // Keep if checking linked products
    private final ProductMasterMapper productMasterMapper;

    public ProductMasterService(ProductMasterRepository productMasterRepository,
                                ProductRepository productRepository,
                                ProductMasterMapper productMasterMapper) {
        this.productMasterRepository = productMasterRepository;
        this.productRepository = productRepository;
        this.productMasterMapper = productMasterMapper;
    }

    /**
     * Creates a new ProductMaster template. (Admin operation)
     * @param productMaster Template details from request.
     * @return DTO of the created template.
     */
    @Transactional // Use Spring's Transactional
    public ProductMasterDTO createTemplate(ProductMaster productMaster) {
        if (productMaster.getName() == null || productMaster.getName().isBlank()) {
            throw new IllegalArgumentException("ProductMaster name cannot be empty.");
        }
        // Check for duplicate name globally for templates
        if (productMasterRepository.findAll()
                .stream()
                .anyMatch(pm -> pm.getName().equalsIgnoreCase(productMaster.getName()))) {
            throw new IllegalArgumentException("ProductMaster template with the same name already exists.");
        }
        ProductMaster saved = productMasterRepository.save(productMaster);
        return productMasterMapper.toProductMasterDTO(saved);
    }

    /**
     * Updates an existing ProductMaster template. (Admin operation)
     * @param id ID of the template to update.
     * @param updated Details to update from the request.
     * @return DTO of the updated template.
     */
    @Transactional // Use Spring's Transactional
    public ProductMasterDTO update(Long id, ProductMaster updated) {
        ProductMaster existing = findByIdInternal(id); // Use internal findById
        // Validation for name (if needed)
        if (updated.getName() == null || updated.getName().isBlank()) {
            throw new IllegalArgumentException("ProductMaster name cannot be empty.");
        }
        // Prevent changing name to one that already exists (excluding self)
        productMasterRepository.findAll().stream()
                .filter(pm -> !pm.getId().equals(id) && pm.getName().equalsIgnoreCase(updated.getName()))
                .findAny()
                .ifPresent(duplicate -> {
                    throw new IllegalArgumentException("Another ProductMaster template with the name '" + updated.getName() + "' already exists.");
                });


        // Update editable fields
        existing.setName(updated.getName());
        existing.setDescription(updated.getDescription());
        existing.setCategory(updated.getCategory());
        ProductMaster saved = productMasterRepository.save(existing);
        return productMasterMapper.toProductMasterDTO(saved);
    }

    /**
     * Deletes a ProductMaster template. (Admin operation)
     * Fails if any Product offerings are linked to this template.
     * @param id ID of the template to delete.
     */
    @Transactional // Use Spring's Transactional
    public void delete(Long id) {
        ProductMaster pm = findByIdInternal(id); // Use internal findById
        // Check if linked Products exist before deleting using ProductRepository
        // This is generally more efficient than loading pm.getProducts() if the list is large
        boolean hasLinkedProducts = productRepository.existsByProductMasterId(id);
        if (hasLinkedProducts) {
            throw new IllegalStateException("Cannot delete ProductMaster template with linked Product offerings.");
        }
        productMasterRepository.delete(pm);
    }

    /**
     * Internal helper method to find the entity by ID.
     * @param id Template ID.
     * @return ProductMaster entity.
     * @throws NoSuchElementException if not found.
     */
    private ProductMaster findByIdInternal(Long id) {
        return productMasterRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("ProductMaster template not found with ID: " + id));
    }

    /**
     * Finds a specific ProductMaster template and returns its DTO representation.
     * @param id Template ID.
     * @return ProductMasterDTO.
     */
    @Transactional(readOnly = true) // readOnly for fetch operations
    public ProductMasterDTO findProductMasterDTOById(Long id) {
        ProductMaster pm = findByIdInternal(id); // Use internal findById
        return productMasterMapper.toProductMasterDTO(pm);
    }

    /**
     * Retrieves all ProductMaster templates as DTOs.
     * @return List of ProductMasterDTOs.
     */
    @Transactional(readOnly = true) // readOnly for fetch operations
    public List<ProductMasterDTO> findAllTemplates() {
        List<ProductMaster> masters = productMasterRepository.findAll();
        return productMasterMapper.toProductMasterDTOList(masters);
    }
    
    public ProductMaster findById(Long productMasterId) {
        return productMasterRepository.findById(productMasterId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Product master not found with ID: " + productMasterId));
    }


    /*
    // --- Optional Search Logic ---
    @Transactional(readOnly = true)
    public List<ProductMasterDTO> searchTemplatesByName(String name) {
        if (name == null || name.isBlank()) {
            return findAllTemplates(); // Return all if search term is empty
        }
        // For better performance on large tables, add a custom query in the repository:
        List<ProductMaster> found = productMasterRepository.findByNameContainingIgnoreCase(name);
        return productMasterMapper.toProductMasterDTOList(found);
    }
    */
}
// Removed duplicate package com.example.washgo.service;