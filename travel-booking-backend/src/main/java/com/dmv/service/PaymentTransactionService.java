package com.dmv.service;

import com.dmv.pojo.PaymentTransaction;
import java.util.List;
import java.util.Map;

public interface PaymentTransactionService {
    List<PaymentTransaction> getMyTransactions(String username, Map<String, String> params);
    Long countMyTransactions(String username);
    List<PaymentTransaction> getProviderTransactions(String username, Map<String, String> params);
    Long countProviderTransactions(String username);
    List<PaymentTransaction> getAdminTransactions(Map<String, String> params);
    Long countAdminTransactions(Map<String, String> params);
    Map<String, Long> countTransactionsByStatus(Map<String, String> params);
    Map<String, Long> paidRevenueByPaymentMethod(Map<String, String> params);
    PaymentTransaction markProviderTransactionPaid(int transactionId, String username);
    PaymentTransaction markAdminTransactionPaid(int transactionId);
    PaymentTransaction markBookingTransactionPaid(int bookingId, String providerTransactionId);
    PaymentTransaction markBookingTransactionFailed(int bookingId, String providerTransactionId);
}
