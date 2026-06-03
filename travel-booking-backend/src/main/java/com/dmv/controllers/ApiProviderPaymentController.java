package com.dmv.controllers;

import com.dmv.pojo.PaymentTransaction;
import com.dmv.service.PaymentTransactionService;
import java.security.Principal;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/secure/provider/payments")
@CrossOrigin
public class ApiProviderPaymentController {
    @Autowired
    private PaymentTransactionService paymentTransactionService;

    @GetMapping
    public ResponseEntity<List<PaymentTransaction>> getTransactions(@RequestParam Map<String, String> params, Principal principal) {
        return ResponseEntity.ok(this.paymentTransactionService.getProviderTransactions(principal.getName(), params));
    }

    @GetMapping("/count")
    public ResponseEntity<Long> countTransactions(Principal principal) {
        return ResponseEntity.ok(this.paymentTransactionService.countProviderTransactions(principal.getName()));
    }

    @PutMapping("/{transactionId}/mark-paid")
    public ResponseEntity<?> markPaid(@PathVariable(value = "transactionId") int transactionId, Principal principal) {
        try {
            PaymentTransaction transaction = this.paymentTransactionService.markProviderTransactionPaid(transactionId, principal.getName());
            if (transaction == null)
                return ResponseEntity.notFound().build();
            return ResponseEntity.ok(transaction);
        } catch (IllegalStateException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }
}
