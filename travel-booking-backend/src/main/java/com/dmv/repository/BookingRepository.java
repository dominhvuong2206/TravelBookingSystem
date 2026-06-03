package com.dmv.repository;
import com.dmv.pojo.Booking;
import java.util.List;
import java.util.Map;

public interface BookingRepository {
    Booking addBooking(Booking booking);
    Booking getBookingById(int id);
    List<Booking> getBookings(Map<String, String> params);
    Long countBookings(Map<String, String> params);
    Booking updateBooking(Booking booking);
}
