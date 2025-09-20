package com.example.washgo.repository;

import com.example.washgo.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;

import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    /**
     * Finds all bookings associated with a specific client user ID.
     * @param clientId The ID of the client user.
     * @return A list of bookings for the client.
     */
	List<Booking> findByUserInformationId(Long clientId);

    /**
     * Finds all bookings associated with a specific carwash profile ID.
     * @param carwashId The ID of the carwash profile.
     * @return A list of bookings for the carwash.
     */
    List<Booking> findByCarwashId(Long carwashId);
  
    @Query(value = "SELECT EXTRACT(MONTH FROM b.created_at) AS month, SUM(pz.price) AS totalRevenue " +
            "FROM booking b " +
            "JOIN product pr ON pr.id = b.product_id " +
            "JOIN pricing pz ON pz.product_id = pr.id " +
            "WHERE EXTRACT(YEAR FROM b.created_at) = :year " +
            "GROUP BY EXTRACT(MONTH FROM b.created_at) " +
            "ORDER BY month", nativeQuery = true)
     List<Object[]> getMonthlyRevenueByYear(@Param("year") int year);


    @Query(value =
            "SELECT gs.month, COALESCE(r.total_revenue,0) AS total_revenue " +
                    "FROM generate_series(1,12) AS gs(month) " +
                    "LEFT JOIN ( " +
                    "  SELECT EXTRACT(MONTH FROM b.created_at)::int AS month, SUM(pz.price) AS total_revenue " +
                    "  FROM booking b " +
                    "  JOIN pricing pz ON pz.product_id = b.product_id " +
                    "  WHERE b.carwash_id = :carwashId " +
                    "    AND EXTRACT(YEAR FROM b.created_at) = :year " +
                    "  GROUP BY EXTRACT(MONTH FROM b.created_at) " +
                    ") r ON gs.month = r.month " +
                    "ORDER BY gs.month",
            nativeQuery = true
    )
    List<Object[]> getMonthlyRevenueByYearByCarWash(
            @Param("carwashId") Long carwashId,
            @Param("year") int year
    );

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.carwash.id = :carwashId")
    long countByCarwash(@Param("carwashId") Long carwashId);


    @Query("""
      SELECT COUNT(b)
      FROM Booking b
      WHERE b.carwash.id = :carwashId
        AND b.createdAt >= :start
        AND b.createdAt < :end
    """)
    long countTodayBookingByCarwash(
            @Param("carwashId") Long carwashId,
            @Param("start") LocalDateTime start,
            @Param("end")   LocalDateTime end
    );

    @Query("""
      SELECT COUNT(b)
      FROM Booking b
        WHERE b.createdAt >= :start
        AND b.createdAt < :end
    """)
    long countTodayBookings(
            @Param("start") LocalDateTime start,
            @Param("end")   LocalDateTime end
    );

    @Query("SELECT DISTINCT b FROM Booking b " +
            "LEFT JOIN FETCH b.feedbacks f " +
            "WHERE b.userInformation.id = :clientId")
    List<Booking> findBookingsWithFeedbacksByClientId(@Param("clientId") Long clientId);


}

