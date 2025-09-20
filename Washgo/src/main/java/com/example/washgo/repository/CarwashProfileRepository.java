package com.example.washgo.repository;

import com.example.washgo.model.CarwashProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalTime;
import java.util.List;

public interface CarwashProfileRepository extends JpaRepository<CarwashProfile, Long> , JpaSpecificationExecutor<CarwashProfile>{

//    @Query(
//            value = ""
//                    + "SELECT DISTINCT "
//                    + "  c.id AS carwash_id, "
//                    + "  c.carwash_name AS carwash_name, "
//                    + "  c.latitude AS latitude, "
//                    + "  c.longitude AS longitude, "
//                    + "  ( "
//                    + "    6371 * acos( "
//                    + "      cos(radians(:userLat)) "
//                    + "      * cos(radians(c.latitude::double precision)) "
//                    + "      * cos(radians(c.longitude::double precision) - radians(:userLon)) "
//                    + "      + sin(radians(:userLat)) "
//                    + "      * sin(radians(c.latitude::double precision)) "
//                    + "    ) "
//                    + "  ) AS distance "
//                    + "FROM carwash_profile c "
//                    + "JOIN product prod ON prod.carwash_owner_id = c.id "
//                    + "JOIN product_master pm ON prod.product_master_id = pm.id "
//                    + "JOIN schedule s ON s.product_id = prod.id "
//                    + "WHERE pm.category = :category "
//                    + "  AND prod.is_active = TRUE "
//                    + "  AND s.is_active = TRUE "
//                    + "  AND :requestedTime BETWEEN s.available_from AND s.available_to "
//                    + "  AND ( "
//                    + "    6371 * acos( "
//                    + "      cos(radians(:userLat)) "
//                    + "      * cos(radians(c.latitude::double precision)) "
//                    + "      * cos(radians(c.longitude::double precision) - radians(:userLon)) "
//                    + "      + sin(radians(:userLat)) "
//                    + "      * sin(radians(c.latitude::double precision)) "
//                    + "    ) "
//                    + "  ) < :radiusKm "
//                    + "ORDER BY distance "
//                    + "LIMIT 20",
//            nativeQuery = true
//    )
//    List<Object[]> findAvailableCarwashesByCategoryAndTime(
//            @Param("userLat") Double userLat,
//            @Param("userLon") Double userLon,
//            @Param("category") String category,
//            @Param("requestedTime") LocalDateTime requestedTime,
//            @Param("radiusKm") Double radiusKm
//    );

    @Query("SELECT c FROM CarwashProfile c " +
    	       "JOIN Schedule s ON c = s.carwash " +
    	       "WHERE s.isActive = true " +
    	       "AND :inputTime BETWEEN s.availableFrom AND s.availableTo")
    	List<CarwashProfile> findAvailableCarwashesAtTime(@Param("inputTime") LocalTime inputTime);


    @Query(value = """

            SELECT carwash_name\s
FROM carwash_profile
WHERE carwash_name ILIKE '%' || :keyword || '%'
LIMIT 10;

                    
            """, nativeQuery = true)
    List<String> searchWith10CarwashsFollowByKeyword(String keyword);


    }

