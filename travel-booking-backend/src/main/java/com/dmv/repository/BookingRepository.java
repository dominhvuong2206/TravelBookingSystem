/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.dmv.repository;

import com.dmv.pojo.CartItem;
import com.dmv.pojo.Booking;
import java.util.List;
import java.util.Map;

/**
 *
 * @author Do Minh Vuong
 */
public interface BookingRepository {
    void addBooking(List<CartItem> carts);
    Booking addBooking(Booking booking);
    Booking getBookingById(int id);
    List<Booking> getBookings(Map<String, String> params);
    Long countBookings(Map<String, String> params);
    Long sumRevenue(Map<String, String> params);
    Map<Integer, Long> revenueByMonth(int year, Map<String, String> params);
    Map<Integer, Long> revenueByQuarter(int year, Map<String, String> params);
    Map<Integer, Long> revenueByYear(Map<String, String> params);
    Map<Integer, Long> bookingFrequencyByMonth(int year, Map<String, String> params);
    Map<Integer, Long> bookingFrequencyByQuarter(int year, Map<String, String> params);
    Map<Integer, Long> bookingFrequencyByYear(Map<String, String> params);
    List<Map<String, Object>> statsByService(Integer providerId);
    Booking updateBooking(Booking booking);
}
