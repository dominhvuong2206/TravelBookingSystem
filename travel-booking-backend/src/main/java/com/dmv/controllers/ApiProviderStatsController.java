package com.dmv.controllers;

import com.dmv.service.BookingService;
import java.security.Principal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/secure/provider/stats")
@CrossOrigin
public class ApiProviderStatsController {
    @Autowired
    private BookingService bookingService;

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> summary(Principal principal) {
        return ResponseEntity.ok(this.bookingService.getProviderSummary(principal.getName()));
    }

    @GetMapping("/revenue")
    public ResponseEntity<Map<String, Object>> revenue(Principal principal, @RequestParam(name = "year", required = false) Integer year) {
        int selectedYear = year != null && year > 0 ? year : LocalDate.now().getYear();
        return ResponseEntity.ok(this.bookingService.getProviderRevenueByMonth(principal.getName(), selectedYear));
    }

    @GetMapping("/revenue/quarter")
    public ResponseEntity<Map<String, Object>> revenueByQuarter(Principal principal, @RequestParam(name = "year", required = false) Integer year) {
        int selectedYear = year != null && year > 0 ? year : LocalDate.now().getYear();
        return ResponseEntity.ok(this.bookingService.getProviderRevenueByQuarter(principal.getName(), selectedYear));
    }

    @GetMapping("/revenue/year")
    public ResponseEntity<Map<String, Object>> revenueByYear(Principal principal) {
        return ResponseEntity.ok(this.bookingService.getProviderRevenueByYear(principal.getName()));
    }

    @GetMapping("/services")
    public ResponseEntity<List<Map<String, Object>>> services(Principal principal) {
        return ResponseEntity.ok(this.bookingService.getProviderStatsByService(principal.getName()));
    }
}
