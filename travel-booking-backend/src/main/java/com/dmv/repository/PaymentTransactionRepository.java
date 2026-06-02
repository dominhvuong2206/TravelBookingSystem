package com.dmv.repository;

import com.dmv.pojo.PaymentTransaction;
import java.util.List;
import java.util.Map;

public interface PaymentTransactionRepository {
    PaymentTransaction addTransaction(PaymentTransaction transaction);
    PaymentTransaction getTransactionById(int id);
    PaymentTransaction getTransactionByBookingId(int bookingId);
    List<PaymentTransaction> getTransactions(Map<String, String> params);
    Long countTransactions(Map<String, String> params);
    Map<String, Long> countByStatus(Map<String, String> params);
    Map<String, Long> paidRevenueByPaymentMethod(Map<String, String> params);
    PaymentTransaction updateTransaction(PaymentTransaction transaction);
}
