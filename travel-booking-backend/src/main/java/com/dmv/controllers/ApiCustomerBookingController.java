package com.dmv.controllers;

import com.dmv.pojo.Booking;
import com.dmv.service.BookingService;
import java.security.Principal;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/secure/bookings")
@CrossOrigin
public class ApiCustomerBookingController {
    @Autowired
    private BookingService bookingService;

    @PostMapping
    public ResponseEntity<?> createBooking(@RequestBody Map<String, String> params, Principal principal) {
        try {
            Booking booking = this.bookingService.createBooking(params, principal.getName());
            return ResponseEntity.status(HttpStatus.CREATED).body(booking);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<Booking>> getMyBookings(@RequestParam Map<String, String> params, Principal principal) {
        return ResponseEntity.ok(this.bookingService.getMyBookings(principal.getName(), params));
    }

    @GetMapping("/count")
    public ResponseEntity<Long> countMyBookings(Principal principal) {
        return ResponseEntity.ok(this.bookingService.countMyBookings(principal.getName()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getMyBookingById(@PathVariable(value = "id") int id, Principal principal) {
        Booking booking = this.bookingService.getMyBookingById(id, principal.getName());
        if (booking == null)
            return ResponseEntity.notFound().build();
        return ResponseEntity.ok(booking);
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelMyBooking(@PathVariable(value = "id") int id, Principal principal) {
        try {
            Booking booking = this.bookingService.cancelMyBooking(id, principal.getName());
            if (booking == null)
                return ResponseEntity.notFound().build();
            return ResponseEntity.ok(booking);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }
}
