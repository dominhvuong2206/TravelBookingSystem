package com.dmv.controllers;
import com.dmv.pojo.Booking;
import com.dmv.service.BookingService;
import java.security.Principal;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
@RestController
@RequestMapping("/api/secure/provider")
@CrossOrigin
public class ApiProviderBookingController {
    @Autowired
    private BookingService bookingService;
    @GetMapping("/services/{serviceId}/bookings")
    public ResponseEntity<List<Booking>> getServiceBookings(
            @PathVariable(value = "serviceId") int serviceId,
            @RequestParam Map<String, String> params,
            Principal principal) {
        return ResponseEntity.ok(this.bookingService.getProviderServiceBookings(serviceId, principal.getName(), params));
    }
    @PutMapping("/bookings/{bookingId}/confirm")
    public ResponseEntity<?> confirmBooking(@PathVariable(value = "bookingId") int bookingId, Principal principal) {
        try {
            Booking booking = this.bookingService.confirmProviderBooking(bookingId, principal.getName());
            if (booking == null)
                return ResponseEntity.notFound().build();
            return ResponseEntity.ok(booking);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }
    @PutMapping("/bookings/{bookingId}/cancel")
    public ResponseEntity<?> cancelBooking(@PathVariable(value = "bookingId") int bookingId, Principal principal) {
        try {
            Booking booking = this.bookingService.cancelProviderBooking(bookingId, principal.getName());
            if (booking == null)
                return ResponseEntity.notFound().build();
            return ResponseEntity.ok(booking);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }
    @PutMapping("/bookings/{bookingId}/mark-paid")
    public ResponseEntity<?> markPaid(@PathVariable(value = "bookingId") int bookingId, Principal principal) {
        try {
            Booking booking = this.bookingService.markProviderBookingPaid(bookingId, principal.getName());
            if (booking == null)
                return ResponseEntity.notFound().build();
            return ResponseEntity.ok(booking);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }
}
