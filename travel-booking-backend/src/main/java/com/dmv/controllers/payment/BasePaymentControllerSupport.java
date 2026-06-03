package com.dmv.controllers.payment;

import com.dmv.pojo.Booking;
import com.dmv.pojo.PaymentTransaction;
import com.dmv.repository.BookingRepository;
import com.dmv.service.PaymentTransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.PropertySource;
import org.springframework.core.env.Environment;

@PropertySource("classpath:configs.properties")
public abstract class BasePaymentControllerSupport {
    @Autowired
    protected BookingRepository bookingRepo;
    @Autowired
    protected PaymentTransactionService paymentTransactionService;
    @Autowired
    protected Environment env;

    protected String frontendUrl() {
        return property("frontend.url", "http://localhost:3000");
    }

    protected String backendUrl() {
        return property("backend.url", "http://localhost:8080/TravelBookingSystem");
    }

    protected String property(String name) {
        return property(name, null);
    }

    protected String property(String name, String defaultValue) {
        String value = System.getenv(name.toUpperCase().replace('.', '_'));
        if (value == null || value.isBlank())
            value = this.env.getProperty(name);
        if ((value == null || value.isBlank()) && defaultValue != null)
            return defaultValue;
        if (value == null || value.isBlank())
            throw new IllegalStateException("Chưa cấu hình " + name + ".");
        return value;
    }

    protected Booking requirePayableBooking(int bookingId, String paymentMethod) {
        Booking booking = this.bookingRepo.getBookingById(bookingId);

        if (booking == null)
            throw new IllegalArgumentException("Booking không tồn tại.");
        if ("CANCELLED".equalsIgnoreCase(booking.getStatus()))
            throw new IllegalStateException("Booking đã bị hủy.");
        if (booking.getPaymentMethod() == null || !paymentMethod.equalsIgnoreCase(booking.getPaymentMethod()))
            throw new IllegalStateException("Phương thức thanh toán của booking không khớp.");
        if ("PAID".equalsIgnoreCase(booking.getPaymentStatus()))
            throw new IllegalStateException("Booking đã thanh toán.");

        return booking;
    }

    protected long amountOf(Booking booking) {
        if (booking.getTotalPrice() == null || booking.getTotalPrice() <= 0)
            throw new IllegalStateException("Booking chưa có tổng tiền hợp lệ.");
        return booking.getTotalPrice();
    }

    protected void completePaidBooking(int bookingId, String gatewayTransactionId) {
        PaymentTransaction transaction = this.paymentTransactionService.markBookingTransactionPaid(bookingId, gatewayTransactionId);
        Booking booking = transaction != null ? transaction.getBookingId() : this.bookingRepo.getBookingById(bookingId);

        if (booking != null && "PENDING".equalsIgnoreCase(booking.getStatus())) {
            booking.setStatus("CONFIRMED");
            this.bookingRepo.updateBooking(booking);
        }
    }

    protected void failBookingPayment(int bookingId, String gatewayTransactionId) {
        this.paymentTransactionService.markBookingTransactionFailed(bookingId, gatewayTransactionId);
    }
}
