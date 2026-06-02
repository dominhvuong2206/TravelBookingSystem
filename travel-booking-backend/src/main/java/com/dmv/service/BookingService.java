/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.dmv.service;

import com.dmv.pojo.CartItem;
import com.dmv.pojo.Booking;
import java.util.List;
import java.util.Map;

/**
 *
 * @author Do Minh Vuong
 */
public interface BookingService {
    void addBooking(List<CartItem> carts);
    Booking createBooking(Map<String, String> params, String username);
    List<Booking> getMyBookings(String username, Map<String, String> params);
    Long countMyBookings(String username);
    Booking getMyBookingById(int id, String username);
    Booking cancelMyBooking(int id, String username);
    List<Booking> getProviderServiceBookings(int serviceId, String username, Map<String, String> params);
    Booking confirmProviderBooking(int bookingId, String username);
    Booking cancelProviderBooking(int bookingId, String username);
    Booking markProviderBookingPaid(int bookingId, String username);
    Map<String, Object> getProviderSummary(String username);
    Map<String, Object> getProviderRevenueByMonth(String username, int year);
    Map<String, Object> getProviderRevenueByQuarter(String username, int year);
    Map<String, Object> getProviderRevenueByYear(String username);
    List<Map<String, Object>> getProviderStatsByService(String username);
    Long countAllBookings();
    Long sumAllRevenue(Map<String, String> params);
    Map<String, Object> getAdminRevenueByMonth(int year);
    Map<String, Object> getAdminRevenueByQuarter(int year);
    Map<String, Object> getAdminRevenueByYear();
    Map<String, Object> getAdminBookingFrequencyByMonth(int year);
    Map<String, Object> getAdminBookingFrequencyByQuarter(int year);
    Map<String, Object> getAdminBookingFrequencyByYear();
    List<Map<String, Object>> getAdminStatsByService();
}
