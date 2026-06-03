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
            throw new IllegalStateException("ChÆ°a cáº¥u hÃ¬nh " + name + ".");
        return value;
    }
    protected Booking requirePayableBooking(int bookingId, String paymentMethod) {
        Booking booking = this.bookingRepo.getBookingById(bookingId);
        if (booking == null)
            throw new IllegalArgumentException("Booking khÃ´ng tá»“n táº¡i.");
        if ("CANCELLED".equalsIgnoreCase(booking.getStatus()))
            throw new IllegalStateException("Booking Ä‘Ã£ bá»‹ há»§y.");
        if (booking.getPaymentMethod() == null || !paymentMethod.equalsIgnoreCase(booking.getPaymentMethod()))
            throw new IllegalStateException("PhÆ°Æ¡ng thá»©c thanh toÃ¡n cá»§a booking khÃ´ng khá»›p.");
        if ("PAID".equalsIgnoreCase(booking.getPaymentStatus()))
            throw new IllegalStateException("Booking Ä‘Ã£ thanh toÃ¡n.");
        return booking;
    }
    protected long amountOf(Booking booking) {
        if (booking.getTotalPrice() == null || booking.getTotalPrice() <= 0)
            throw new IllegalStateException("Booking chÆ°a cÃ³ tá»•ng tiá»n há»£p lá»‡.");
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
