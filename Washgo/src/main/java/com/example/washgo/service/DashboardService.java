package com.example.washgo.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Comparator;
import java.util.HashMap;


import org.springframework.stereotype.Service;

import com.example.washgo.dtos.DailyRevenueDTO;
import com.example.washgo.dtos.MonthlyRevenueDTO;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DashboardService {

	private final PaymentService paymentService;
	private final BookingService bookingService;
	private final UserRegistrationService userRegistrationService;

	public List<MonthlyRevenueDTO> getMonthlyRevenueFromPayment(int year) {
		return paymentService.getMonthlyRevenueFromPayment(year);
	}

	public List<DailyRevenueDTO> getDailyRevenue(int year, int month) {
		return paymentService.getDailyRevenue(year, month);
	}

	public List<MonthlyRevenueDTO> getMonthlyRevenueFromPaymentByCarWash(Long carwashId,int year) {
		return paymentService.getMonthlyRevenueFromPaymentByCarwash(carwashId, year);
	}

	public List<DailyRevenueDTO> getDailyRevenueByCarwash(Long carwashId, int year, int month) {
		return paymentService.getDailyRevenueByCarwash(carwashId, year, month);
	}

	public long countBooking() {
		return bookingService.countBooking();
	}

	public long countBookingByCarwash(Long carwashId) {
		return bookingService.countBookingCarwash(carwashId);
	}

	public long countCarwash() {
		return userRegistrationService.countCarwash();
	}

	public long countClient() {
		return userRegistrationService.countClient();
	}

	public Map<String, Object> getRevenueComparison(int year, int month) {
		List<DailyRevenueDTO> dailyList = getDailyRevenue(year, month); // đã có sẵn repo gọi rồi

		LocalDate today = LocalDate.now();

		double todayRevenue = dailyList.stream()
				.filter(d -> d.getDate().isEqual(today))
				.map(DailyRevenueDTO::getTotalRevenue)
				.findFirst().orElse(0.0);

		double avg2DaysBefore = dailyList.stream()
				.filter(d -> d.getDate().isBefore(today))
				.sorted(Comparator.comparing(DailyRevenueDTO::getDate).reversed())
				.limit(2)
				.mapToDouble(DailyRevenueDTO::getTotalRevenue)
				.average()
				.orElse(0.0);

		double percentChange = avg2DaysBefore == 0 ? 100.0 : ((todayRevenue - avg2DaysBefore) / avg2DaysBefore) * 100;

		Map<String, Object> response = new HashMap<>();
		response.put("today", today);
		response.put("todayRevenue", todayRevenue);
		response.put("averageRevenueLast2Days", avg2DaysBefore);
		response.put("percentChange", percentChange);

		return response;
	}

	public Map<String, Object> getRevenueComparisonByCarwash(Long carwashId, int year, int month) {
		// Fetch daily revenue list for the carwash
		List<DailyRevenueDTO> dailyList = getDailyRevenueByCarwash(carwashId, year, month);

		LocalDate today = LocalDate.now();

		// Today's revenue (0.0 if no data)
		double todayRevenue = dailyList.stream()
				.filter(d -> d.getDate().isEqual(today))
				.mapToDouble(DailyRevenueDTO::getTotalRevenue)
				.findFirst()
				.orElse(0.0);

		// Average of the two days immediately preceding today
		double avg2DaysBefore = dailyList.stream()
				.filter(d -> d.getDate().isBefore(today))
				.sorted(Comparator.comparing(DailyRevenueDTO::getDate).reversed())
				.limit(2)
				.mapToDouble(DailyRevenueDTO::getTotalRevenue)
				.average()
				.orElse(0.0);

		// Percent change (if previous average is 0, treat as +100%)
		double percentChange = avg2DaysBefore == 0.0
				? 100.0
				: ((todayRevenue - avg2DaysBefore) / avg2DaysBefore) * 100.0;

		Map<String, Object> response = new HashMap<>();
		response.put("today", today);
		response.put("todayRevenue", todayRevenue);
		response.put("averageRevenueLast2Days", avg2DaysBefore);
		response.put("percentChange", percentChange);

		return response;
	}

	public BigDecimal getTotalRevenue() {
		return paymentService.getTotalRevenueAll();
	}

	public long getTodayBookingCount(Long carwashId) {
		return bookingService.countTodayBookingsByCarwash(carwashId);
	}

	public BigDecimal getTotalRevenueByCarwash(Long carwashId) {
		return paymentService.getTotalRevenueByCarwash(carwashId);
	}

	public long countTodayBookings() {
		return bookingService.countTodayBookings();
	}
}

