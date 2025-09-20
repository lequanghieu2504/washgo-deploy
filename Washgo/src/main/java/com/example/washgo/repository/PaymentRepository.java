package com.example.washgo.repository;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.washgo.model.Payment;
@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

	@Query(value = "SELECT EXTRACT(MONTH FROM p.created_at) AS month, SUM(p.price) " +
            "FROM payment p " +
            "WHERE EXTRACT(YEAR FROM p.created_at) = :year " +
            "GROUP BY EXTRACT(MONTH FROM p.created_at)", nativeQuery = true)
List<Object[]> getMonthlyRevenue(@Param("year") int year);

    @Query(
            value = """
        SELECT 
          CAST(p.created_at AS date) AS day, 
          SUM(p.price) AS total_revenue 
        FROM payment p 
        WHERE p.status = 'PAID' 
          AND EXTRACT(YEAR FROM p.created_at) = :year 
          AND EXTRACT(MONTH FROM p.created_at) = :month 
        GROUP BY day 
        ORDER BY day
      """,
            nativeQuery = true
    )
 List<Object[]> getDailyRevenueByMonth(@Param("year") int year, @Param("month") int month);

    @Query(value =
            "SELECT EXTRACT(MONTH FROM p.created_at) AS month, SUM(p.price) " +
                    "FROM payment p " +
                    "WHERE p.carwash_id = :carwashId " +
                    "  AND EXTRACT(YEAR FROM p.created_at) = :year " +
                    "GROUP BY EXTRACT(MONTH FROM p.created_at)",
            nativeQuery = true
    )
    List<Object[]> getMonthlyRevenueByCarwash(
            @Param("carwashId") Long carwashId,
            @Param("year")       int year
    );

    @Query(
            value = """
        SELECT 
          CAST(p.created_at AS date) AS day, 
          SUM(p.price) AS total_revenue 
        FROM payment p 
        WHERE p.carwash_id = :carwashId
	  AND p.status = 'PAID' 
          AND EXTRACT(YEAR FROM p.created_at) = :year 
          AND EXTRACT(MONTH FROM p.created_at) = :month 
        GROUP BY day 
        ORDER BY day
      """,
            nativeQuery = true
    )
    List<Object[]> getDailyRevenueByCarwash(@Param("carwashId") Long carwashId,@Param("year") int year, @Param("month") int month);

   @Query("""
      SELECT COALESCE(SUM(p.price), 0)
      FROM Payment p
      WHERE p.status = 'PAID'
    """)
   BigDecimal sumAllPaid();


    @Query("""
      SELECT COALESCE(SUM(p.price), 0)
      FROM Payment p
      WHERE p.carwashProfile.id = :carwashId
        AND p.status = 'PAID'
    """)
    BigDecimal sumPaidByCarwash(@Param("carwashId") Long carwashId);

    void deleteByBookingId(Long bookingId);

	Payment findByBookingId(Long id);

}

