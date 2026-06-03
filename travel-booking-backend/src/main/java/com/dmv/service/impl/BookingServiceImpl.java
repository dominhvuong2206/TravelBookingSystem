package com.dmv.service.impl;
import com.dmv.pojo.Booking;
import com.dmv.pojo.CartItem;
import com.dmv.pojo.PaymentTransaction;
import com.dmv.pojo.TravelService;
import com.dmv.pojo.User;
import com.dmv.repository.BookingRepository;
import com.dmv.repository.PaymentTransactionRepository;
import com.dmv.repository.TravelServiceRepository;
import com.dmv.repository.UserRepository;
import com.dmv.service.BookingService;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
@Service
public class BookingServiceImpl implements BookingService {
    @Autowired
    private BookingRepository bookingRepo;
    @Autowired
    private TravelServiceRepository travelServiceRepo;
    @Autowired
    private UserRepository userRepo;
    @Autowired
    private PaymentTransactionRepository paymentTransactionRepo;
    @Override
    public void addBooking(List<CartItem> carts) {
        this.bookingRepo.addBooking(carts);
    }
    @Override
    public Booking createBooking(Map<String, String> params, String username) {
        User customer = this.userRepo.getUserByUsername(username);
        TravelService service = this.travelServiceRepo.getTravelServiceById(Integer.parseInt(params.get("serviceId")));
        int quantity = Integer.parseInt(params.getOrDefault("quantity", "1"));
        if (service == null)
            throw new IllegalArgumentException("Dịch vụ không tồn tại.");
        if (quantity <= 0)
            throw new IllegalArgumentException("Số lượng không hợp lệ.");
        if (service.getAvailableSlots() != null && service.getAvailableSlots() < quantity)
            throw new IllegalArgumentException("Không đủ chỗ trống.");
        Booking booking = new Booking();
        booking.setServiceNameSnapshot(service.getName());
        booking.setUnitPrice(service.getPrice());
        booking.setQuantity(quantity);
        booking.setTotalPrice(service.getPrice() * quantity);
        booking.setStatus("PENDING");
        String paymentMethod = params.getOrDefault("paymentMethod", "CASH");
        booking.setPaymentMethod(paymentMethod);
        booking.setPaymentStatus("UNPAID");
        booking.setNote(params.get("note"));
        booking.setCreatedDate(new Date());
        booking.setServiceId(service);
        booking.setCustomerId(customer);
        if (service.getAvailableSlots() != null) {
            service.setAvailableSlots(service.getAvailableSlots() - quantity);
            this.travelServiceRepo.addOrUpdateTravelService(service);
        }
        Booking savedBooking = this.bookingRepo.addBooking(booking);
        this.paymentTransactionRepo.addTransaction(buildInitialTransaction(savedBooking, paymentMethod));
        return savedBooking;
    }
    @Override
    public List<Booking> getMyBookings(String username, Map<String, String> params) {
        User customer = this.userRepo.getUserByUsername(username);
        Map<String, String> filters = new HashMap<>(params);
        filters.put("customerId", String.valueOf(customer.getId()));
        return this.bookingRepo.getBookings(filters);
    }
    @Override
    public Long countMyBookings(String username) {
        User customer = this.userRepo.getUserByUsername(username);
        Map<String, String> filters = new HashMap<>();
        filters.put("customerId", String.valueOf(customer.getId()));
        return this.bookingRepo.countBookings(filters);
    }
    @Override
    public Booking getMyBookingById(int id, String username) {
        User customer = this.userRepo.getUserByUsername(username);
        Booking booking = this.bookingRepo.getBookingById(id);
        if (booking == null || !booking.getCustomerId().getId().equals(customer.getId()))
            return null;
        return booking;
    }
    @Override
    public Booking cancelMyBooking(int id, String username) {
        Booking booking = this.getMyBookingById(id, username);
        if (booking == null)
            return null;
        if (!"PENDING".equals(booking.getStatus()))
            throw new IllegalArgumentException("Chỉ có thể hủy booking đang chờ xác nhận.");
        if ("PAID".equals(booking.getPaymentStatus()))
            throw new IllegalArgumentException("Không thể hủy booking đã thanh toán.");
        booking.setStatus("CANCELLED");
        cancelPendingTransaction(booking);
        restoreSlots(booking);
        return this.bookingRepo.updateBooking(booking);
    }
    @Override
    public List<Booking> getProviderServiceBookings(int serviceId, String username, Map<String, String> params) {
        User provider = this.userRepo.getUserByUsername(username);
        TravelService service = this.travelServiceRepo.getTravelServiceById(serviceId);
        if (service == null || !service.getProviderId().getId().equals(provider.getId()))
            return List.of();
        Map<String, String> filters = new HashMap<>(params);
        filters.put("serviceId", String.valueOf(serviceId));
        filters.put("providerId", String.valueOf(provider.getId()));
        return this.bookingRepo.getBookings(filters);
    }
    @Override
    public Booking confirmProviderBooking(int bookingId, String username) {
        Booking booking = getOwnedProviderBooking(bookingId, username);
        if (booking == null)
            return null;
        if (!"PENDING".equals(booking.getStatus()))
            throw new IllegalArgumentException("Chỉ có thể xác nhận booking đang chờ.");
        booking.setStatus("CONFIRMED");
        return this.bookingRepo.updateBooking(booking);
    }
    @Override
    public Booking cancelProviderBooking(int bookingId, String username) {
        Booking booking = getOwnedProviderBooking(bookingId, username);
        if (booking == null)
            return null;
        if ("CANCELLED".equals(booking.getStatus()))
            return booking;
        if ("PAID".equals(booking.getPaymentStatus()))
            throw new IllegalArgumentException("Không thể hủy booking đã thanh toán.");
        if ("PENDING".equals(booking.getStatus()))
            restoreSlots(booking);
        booking.setStatus("CANCELLED");
        cancelPendingTransaction(booking);
        return this.bookingRepo.updateBooking(booking);
    }
    @Override
    public Booking markProviderBookingPaid(int bookingId, String username) {
        Booking booking = getOwnedProviderBooking(bookingId, username);
        if (booking == null)
            return null;
        if ("CANCELLED".equals(booking.getStatus()))
            throw new IllegalArgumentException("Không thể xác nhận thanh toán cho booking đã hủy.");
        booking.setPaymentStatus("PAID");
        Booking updatedBooking = this.bookingRepo.updateBooking(booking);
        PaymentTransaction transaction = this.paymentTransactionRepo.getTransactionByBookingId(bookingId);
        if (transaction != null && !"PAID".equals(transaction.getStatus())) {
            transaction.setStatus("PAID");
            this.paymentTransactionRepo.updateTransaction(transaction);
        }
        return updatedBooking;
    }
    @Override
    public Map<String, Object> getProviderSummary(String username) {
        User provider = this.userRepo.getUserByUsername(username);
        Map<String, String> serviceFilter = new HashMap<>();
        serviceFilter.put("providerId", String.valueOf(provider.getId()));
        serviceFilter.put("allStatus", "true");
        Map<String, String> bookingFilter = new HashMap<>();
        bookingFilter.put("providerId", String.valueOf(provider.getId()));
        bookingFilter.put("notStatus", "CANCELLED");
        Map<String, String> pendingFilter = new HashMap<>(bookingFilter);
        pendingFilter.put("status", "PENDING");
        Map<String, String> paidFilter = new HashMap<>(bookingFilter);
        paidFilter.put("paymentStatus", "PAID");
        Map<String, Object> result = new HashMap<>();
        result.put("totalServices", this.travelServiceRepo.countTravelServices(serviceFilter));
        result.put("totalBookings", this.bookingRepo.countBookings(bookingFilter));
        result.put("pendingBookings", this.bookingRepo.countBookings(pendingFilter));
        result.put("paidRevenue", this.bookingRepo.sumRevenue(paidFilter));
        return result;
    }
    @Override
    public Map<String, Object> getProviderRevenueByMonth(String username, int year) {
        User provider = this.userRepo.getUserByUsername(username);
        Map<String, String> filter = new HashMap<>();
        filter.put("providerId", String.valueOf(provider.getId()));
        Map<Integer, Long> byMonth = this.bookingRepo.revenueByMonth(year, filter);
        return buildRevenueResult(year, byMonth);
    }
    @Override
    public Map<String, Object> getProviderRevenueByQuarter(String username, int year) {
        User provider = this.userRepo.getUserByUsername(username);
        Map<String, String> filter = new HashMap<>();
        filter.put("providerId", String.valueOf(provider.getId()));
        Map<Integer, Long> byQuarter = this.bookingRepo.revenueByQuarter(year, filter);
        return buildRevenueResult(year, byQuarter);
    }
    @Override
    public Map<String, Object> getProviderRevenueByYear(String username) {
        User provider = this.userRepo.getUserByUsername(username);
        Map<String, String> filter = new HashMap<>();
        filter.put("providerId", String.valueOf(provider.getId()));
        Map<Integer, Long> byYear = this.bookingRepo.revenueByYear(filter);
        return buildRevenueResult(null, byYear);
    }
    @Override
    public List<Map<String, Object>> getProviderStatsByService(String username) {
        User provider = this.userRepo.getUserByUsername(username);
        return this.bookingRepo.statsByService(provider.getId());
    }
    @Override
    public Long countAllBookings() {
        return this.bookingRepo.countBookings(null);
    }
    @Override
    public Long sumAllRevenue(Map<String, String> params) {
        return this.bookingRepo.sumRevenue(params);
    }
    @Override
    public Map<String, Object> getAdminRevenueByMonth(int year) {
        return buildRevenueResult(year, this.bookingRepo.revenueByMonth(year, null));
    }
    @Override
    public Map<String, Object> getAdminRevenueByQuarter(int year) {
        return buildRevenueResult(year, this.bookingRepo.revenueByQuarter(year, null));
    }
    @Override
    public Map<String, Object> getAdminRevenueByYear() {
        return buildRevenueResult(null, this.bookingRepo.revenueByYear(null));
    }
    @Override
    public Map<String, Object> getAdminBookingFrequencyByMonth(int year) {
        return buildRevenueResult(year, this.bookingRepo.bookingFrequencyByMonth(year, null));
    }
    @Override
    public Map<String, Object> getAdminBookingFrequencyByQuarter(int year) {
        return buildRevenueResult(year, this.bookingRepo.bookingFrequencyByQuarter(year, null));
    }
    @Override
    public Map<String, Object> getAdminBookingFrequencyByYear() {
        return buildRevenueResult(null, this.bookingRepo.bookingFrequencyByYear(null));
    }
    @Override
    public List<Map<String, Object>> getAdminStatsByService() {
        return this.bookingRepo.statsByService(null);
    }
    private Map<String, Object> buildRevenueResult(Integer year, Map<Integer, Long> values) {
        long total = values.values().stream().mapToLong(Long::longValue).sum();
        Map<String, Object> result = new HashMap<>();
        result.put("year", year);
        result.put("values", values);
        result.put("byMonth", values);
        result.put("total", total);
        return result;
    }
    private Booking getOwnedProviderBooking(int bookingId, String username) {
        User provider = this.userRepo.getUserByUsername(username);
        Booking booking = this.bookingRepo.getBookingById(bookingId);
        if (booking == null || !booking.getServiceId().getProviderId().getId().equals(provider.getId()))
            return null;
        return booking;
    }
    private PaymentTransaction buildInitialTransaction(Booking booking, String paymentMethod) {
        PaymentTransaction transaction = new PaymentTransaction();
        transaction.setBookingId(booking);
        transaction.setAmount(booking.getTotalPrice());
        transaction.setPaymentMethod(paymentMethod);
        transaction.setProviderTransactionId(String.format("TXN-%s-%d", paymentMethod, System.currentTimeMillis()));
        transaction.setStatus("PENDING");
        transaction.setCreatedDate(new Date());
        return transaction;
    }
    private void cancelPendingTransaction(Booking booking) {
        PaymentTransaction transaction = this.paymentTransactionRepo.getTransactionByBookingId(booking.getId());
        if (transaction != null && !"PAID".equals(transaction.getStatus())) {
            transaction.setStatus("FAILED");
            this.paymentTransactionRepo.updateTransaction(transaction);
        }
    }
    private void restoreSlots(Booking booking) {
        TravelService service = booking.getServiceId();
        if (service.getAvailableSlots() != null) {
            service.setAvailableSlots(service.getAvailableSlots() + booking.getQuantity());
            this.travelServiceRepo.addOrUpdateTravelService(service);
        }
    }
}
