package com.dmv.controllers;
import com.dmv.pojo.CartItem;
import com.dmv.service.BookingService;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
@RestController
@RequestMapping("/api")
public class ApiBookingController {
    @Autowired
    private BookingService bookingService;
    @PostMapping("/secure/pay")
    @ResponseStatus(HttpStatus.CREATED)
    public void addBooking(@RequestBody List<CartItem> carts) {
        this.bookingService.addBooking(carts);
    }
}
