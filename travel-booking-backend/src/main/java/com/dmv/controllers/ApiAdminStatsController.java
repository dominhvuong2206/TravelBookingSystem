package com.dmv.controllers;
import com.dmv.service.BookingService;
import com.dmv.service.PaymentTransactionService;
import com.dmv.service.TravelServiceService;
import com.dmv.service.UserService;
import java.time.LocalDate;
import java.util.List;
import java.util.HashMap;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
@RestController
@RequestMapping("/api/secure/admin/stats")
@CrossOrigin
public class ApiAdminStatsController {
    @Autowired
    private UserService userService;
    @Autowired
    private TravelServiceService travelServiceService;
    @Autowired
    private BookingService bookingService;
    @Autowired
    private PaymentTransactionService paymentTransactionService;
    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> summary() {
        Map<String, String> pendingProviders = new HashMap<>();
        pendingProviders.put("role", "ROLE_PROVIDER");
        pendingProviders.put("approved", "false");
        Map<String, String> allServices = new HashMap<>();
        allServices.put("allStatus", "true");
        Map<String, String> activeServices = new HashMap<>();
        activeServices.put("status", "ACTIVE");
        Map<String, String> paidBookings = new HashMap<>();
        paidBookings.put("paymentStatus", "PAID");
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", this.userService.countUsers(null));
        stats.put("pendingProviders", this.userService.countUsers(pendingProviders));
        stats.put("totalServices", this.travelServiceService.countTravelServices(allServices));
        stats.put("activeServices", this.travelServiceService.countTravelServices(activeServices));
        stats.put("totalBookings", this.bookingService.countAllBookings());
        stats.put("paidRevenue", this.bookingService.sumAllRevenue(paidBookings));
        stats.put("transactionStatusCounts", this.paymentTransactionService.countTransactionsByStatus(null));
        stats.put("revenueByPaymentMethod", this.paymentTransactionService.paidRevenueByPaymentMethod(null));
        return ResponseEntity.ok(stats);
    }
    @GetMapping("/revenue")
    public ResponseEntity<Map<String, Object>> revenue(@RequestParam(name = "year", required = false) Integer year) {
        int selectedYear = year != null && year > 0 ? year : LocalDate.now().getYear();
        return ResponseEntity.ok(this.bookingService.getAdminRevenueByMonth(selectedYear));
    }
    @GetMapping("/revenue/quarter")
    public ResponseEntity<Map<String, Object>> revenueByQuarter(@RequestParam(name = "year", required = false) Integer year) {
        int selectedYear = year != null && year > 0 ? year : LocalDate.now().getYear();
        return ResponseEntity.ok(this.bookingService.getAdminRevenueByQuarter(selectedYear));
    }
    @GetMapping("/revenue/year")
    public ResponseEntity<Map<String, Object>> revenueByYear() {
        return ResponseEntity.ok(this.bookingService.getAdminRevenueByYear());
    }
    @GetMapping("/services")
    public ResponseEntity<List<Map<String, Object>>> services() {
        return ResponseEntity.ok(this.bookingService.getAdminStatsByService());
    }
    @GetMapping("/booking-frequency")
    public ResponseEntity<Map<String, Object>> bookingFrequency(@RequestParam(name = "year", required = false) Integer year) {
        int selectedYear = year != null && year > 0 ? year : LocalDate.now().getYear();
        return ResponseEntity.ok(this.bookingService.getAdminBookingFrequencyByMonth(selectedYear));
    }
    @GetMapping("/booking-frequency/quarter")
    public ResponseEntity<Map<String, Object>> bookingFrequencyByQuarter(@RequestParam(name = "year", required = false) Integer year) {
        int selectedYear = year != null && year > 0 ? year : LocalDate.now().getYear();
        return ResponseEntity.ok(this.bookingService.getAdminBookingFrequencyByQuarter(selectedYear));
    }
    @GetMapping("/booking-frequency/year")
    public ResponseEntity<Map<String, Object>> bookingFrequencyByYear() {
        return ResponseEntity.ok(this.bookingService.getAdminBookingFrequencyByYear());
    }
}
