// src/main/java/com/example/washgo/repository/ProductRepository.java
package com.example.washgo.repository;

import com.example.washgo.model.Product;
import com.example.washgo.model.UserInformation; // Import UserInformation
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List; // Import List

public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByCarwashOwner(UserInformation carwashOwner);

    // Optional: Find by owner AND master template
    List<Product> findByCarwashOwnerIdAndProductMasterId(Long carwashOwnerId, Long productMasterId);

    // Add this method for ProductService.createProductOffering check
    boolean existsByCarwashOwnerIdAndProductMasterId(Long carwashOwnerId, Long productMasterId);

    // Add this method for ProductMasterService.delete check
    boolean existsByProductMasterId(Long productMasterId);

    // Add this method for ProductService.findProductsByCarwash
    List<Product> findByCarwashOwnerId(Long carwashOwnerId);

    @Query("SELECT p FROM Product p LEFT JOIN FETCH p.pricing WHERE p.carwashOwner.id = :carwashId")
    List<Product> findAllWithPricingByCarwashId(@Param("carwashId") Long carwashId);

    @Query("SELECT p FROM Product p WHERE p.parent IS NOT NULL AND p.productMaster.id = :productMasterId AND p.carwashOwner.id = :carwashId")
    List<Product> findAllSubProuductByProductMasterId(@Param("carwashId") Long carwashId, @Param("productMasterId") Long productMasterId);



//    @Query("SELECT DISTINCT p FROM Product p " +
//            "JOIN p.productMaster pm " +
//            "JOIN FETCH p.schedules s " +
//            "WHERE pm.category = :category " +
//            "AND p.isActive = true " +
//            "AND s.isActive = true " +
//            "AND :requestedTime BETWEEN s.availableFrom AND s.availableTo ")
//    List<Product> findAvailableProductsByCategoryAndTime(
//            @Param("category") String category,
//            @Param("requestedTime") LocalDateTime requestedTime);
}