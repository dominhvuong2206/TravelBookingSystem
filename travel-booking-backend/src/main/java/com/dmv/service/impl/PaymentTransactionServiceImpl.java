package com.dmv.service.impl;

import com.dmv.pojo.PaymentTransaction;
import com.dmv.pojo.TravelService;
import com.dmv.pojo.User;
import com.dmv.repository.BookingRepository;
import com.dmv.repository.PaymentTransactionRepository;
import com.dmv.repository.TravelServiceRepository;
import com.dmv.repository.UserRepository;
import com.dmv.service.PaymentTransactionService;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class PaymentTransactionServiceImpl implements PaymentTransactionService {
    @Autowired
    private PaymentTransactionRepository paymentTransactionRepo;
    @Autowired
    private UserRepository userRepo;
    @Autowired
    private BookingRepository bookingRepo;
    @Autowired
    private TravelServiceRepository travelServiceRepo;

    @Override
    public List<PaymentTransaction> getMyTransactions(String username, Map<String, String> params) {
        User customer = this.userRepo.getUserByUsername(username);
        Map<String, String> filters = new HashMap<>(params);
        filters.put("customerId", String.valueOf(customer.getId()));
        return this.paymentTransactionRepo.getTransactions(filters);
    }

    @Override
    public Long countMyTransactions(String username) {
        User customer = this.userRepo.getUserByUsername(username);
        Map<String, String> filters = new HashMap<>();
        filters.put("customerId", String.valueOf(customer.getId()));
        return this.paymentTransactionRepo.countTransactions(filters);
    }

    @Override
    public List<PaymentTransaction> getProviderTransactions(String username, Map<String, String> params) {
        User provider = this.userRepo.getUserByUsername(username);
        Map<String, String> filters = new HashMap<>(params);
        filters.put("providerId", String.valueOf(provider.getId()));
        return this.paymentTransactionRepo.getTransactions(filters);
    }

    @Override
    public Long countProviderTransactions(String username) {
        User provider = this.userRepo.getUserByUsername(username);
        Map<String, String> filters = new HashMap<>();
        filters.put("providerId", String.valueOf(provider.getId()));
        return this.paymentTransactionRepo.countTransactions(filters);
    }

    @Override
    public List<PaymentTransaction> getAdminTransactions(Map<String, String> params) {
        return this.paymentTransactionRepo.getTransactions(params);
    }

    @Override
    public Long countAdminTransactions(Map<String, String> params) {
        return this.paymentTransactionRepo.countTransactions(params);
    }

    @Override
    public Map<String, Long> countTransactionsByStatus(Map<String, String> params) {
        return this.paymentTransactionRepo.countByStatus(params);
    }

    @Override
    public Map<String, Long> paidRevenueByPaymentMethod(Map<String, String> params) {
        return this.paymentTransactionRepo.paidRevenueByPaymentMethod(params);
    }

    @Override
    public PaymentTransaction markProviderTransactionPaid(int transactionId, String username) {
        User provider = this.userRepo.getUserByUsername(username);
        PaymentTransaction transaction = this.paymentTransactionRepo.getTransactionById(transactionId);

        if (transaction == null || !transaction.getBookingId().getServiceId().getProviderId().getId().equals(provider.getId()))
            return null;

        return markPaid(transaction);
    }

    @Override
    public PaymentTransaction markAdminTransactionPaid(int transactionId) {
        PaymentTransaction transaction = this.paymentTransactionRepo.getTransactionById(transactionId);

        if (transaction == null)
            return null;

        return markPaid(transaction);
    }

    @Override
    public PaymentTransaction markBookingTransactionPaid(int bookingId, String providerTransactionId) {
        PaymentTransaction transaction = this.paymentTransactionRepo.getTransactionByBookingId(bookingId);

        if (transaction == null)
            return null;

        if (providerTransactionId != null && !providerTransactionId.isBlank())
            transaction.setProviderTransactionId(providerTransactionId);

        return markPaid(transaction);
    }

    @Override
    public PaymentTransaction markBookingTransactionFailed(int bookingId, String providerTransactionId) {
        PaymentTransaction transaction = this.paymentTransactionRepo.getTransactionByBookingId(bookingId);

        if (transaction == null)
            return null;

        if (providerTransactionId != null && !providerTransactionId.isBlank())
            transaction.setProviderTransactionId(providerTransactionId);

        transaction.setStatus("FAILED");
        transaction.getBookingId().setPaymentStatus("FAILED");
        if ("PENDING".equals(transaction.getBookingId().getStatus())) {
            transaction.getBookingId().setStatus("CANCELLED");
            restoreSlots(transaction);
        }
        this.bookingRepo.updateBooking(transaction.getBookingId());
        return this.paymentTransactionRepo.updateTransaction(transaction);
    }

    private PaymentTransaction markPaid(PaymentTransaction transaction) {
        if ("CANCELLED".equals(transaction.getBookingId().getStatus()))
            throw new IllegalStateException("Không thể xác nhận thanh toán cho booking đã hủy.");

        transaction.setStatus("PAID");
        transaction.getBookingId().setPaymentStatus("PAID");
        this.bookingRepo.updateBooking(transaction.getBookingId());
        return this.paymentTransactionRepo.updateTransaction(transaction);
    }

    private void restoreSlots(PaymentTransaction transaction) {
        TravelService service = transaction.getBookingId().getServiceId();
        if (service.getAvailableSlots() != null) {
            service.setAvailableSlots(service.getAvailableSlots() + transaction.getBookingId().getQuantity());
            this.travelServiceRepo.addOrUpdateTravelService(service);
        }
    }
}
