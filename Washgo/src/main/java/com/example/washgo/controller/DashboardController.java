package com.example.washgo.controller;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.washgo.dtos.DailyRevenueDTO;
import com.example.washgo.service.DashboardService;

import lombok.RequiredArgsConstructor;
import com.example.washgo.dtos.MonthlyRevenueDTO;

@RestController
    @RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {
    @Autowired
    private final DashboardService dashboardService;

    // getClient
    @GetMapping("/countClient")
   @PreAuthorize("hasRole('ADMIN')")
    public long countClient() {
        return dashboardService.countClient();
    }
    @GetMapping("/countCarwash")
    @PreAuthorize("hasRole('ADMIN')")
     public long countCarwash() {
    	return dashboardService.countCarwash();
    }
    @GetMapping("/countBooking")
    @PreAuthorize("hasRole('ADMIN')")
    public long countBooking() {
    	return dashboardService.countBooking();
    }

    @GetMapping("/countTodayBookings")
    @PreAuthorize("hasRole('ADMIN')")
    public long countTodayBooking() {
        return dashboardService.countTodayBookings();
    }

    @GetMapping("/totalRevenue")
    public BigDecimal totalRevenue() {
        return dashboardService.getTotalRevenue();
    }

    @GetMapping("/countBookingByCarwash")
//    @PreAuthorize("hasRole('CARWASH')")
    public long countBookingByCarwash(Long carwashId) {
        return dashboardService.countBookingByCarwash(carwashId);
    }

    @GetMapping("revenue/monthly")
    public List<MonthlyRevenueDTO> getMonthlyRevenue(@RequestParam int year) {
        return dashboardService.getMonthlyRevenueFromPayment(year);
    }
    @GetMapping("/revenue/daily")
    public List<DailyRevenueDTO> getDailyRevenue(@RequestParam int year, @RequestParam int month) {
        return dashboardService.getDailyRevenue(year, month);
    }
    @GetMapping("/revenue/daily/compare")
    public Map<String, Object> getRevenueComparison(@RequestParam int year, @RequestParam int month) {
        return dashboardService.getRevenueComparison(year, month);
    }

    @GetMapping("/revenue/monthlyCarwash")
    public List<MonthlyRevenueDTO> getMonthlyRevenue(
            @RequestParam Long carwashId,
            @RequestParam int year) {
        return dashboardService.getMonthlyRevenueFromPaymentByCarWash(carwashId, year);
    }

    @GetMapping("/revenue/dailyCarwash")
    public List<DailyRevenueDTO> getDailyRevenue(
            @RequestParam Long carwashId,
            @RequestParam int year,
            @RequestParam int month) {
        return dashboardService.getDailyRevenueByCarwash(carwashId, year, month);
    }

    @GetMapping("/revenue/daily/compareCarwash")
    public Map<String, Object> getRevenueComparison(
            @RequestParam Long carwashId,
            @RequestParam int year,
            @RequestParam int month) {
        return dashboardService.getRevenueComparisonByCarwash(carwashId, year, month);
    }

    @GetMapping("/countBookingByCarwashToday")
    public long countBookingToday(
            @RequestParam("carwashId") Long carwashId
    ) {
        return dashboardService.getTodayBookingCount(carwashId);
    }


    @GetMapping("/totalRevenueByCarwash")
    public BigDecimal totalRevenueByCarwash(
            @RequestParam("carwashId") Long carwashId
    ) {
        return dashboardService.getTotalRevenueByCarwash(carwashId);
    }
    // --- READ ---

}
