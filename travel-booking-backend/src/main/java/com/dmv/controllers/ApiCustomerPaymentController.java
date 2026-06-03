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
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/secure/payments")
@CrossOrigin
public class ApiCustomerPaymentController {
    @Autowired
    private PaymentTransactionService paymentTransactionService;
    @GetMapping
    public ResponseEntity<List<PaymentTransaction>> getMyTransactions(@RequestParam Map<String, String> params, Principal principal) {
        return ResponseEntity.ok(this.paymentTransactionService.getMyTransactions(principal.getName(), params));
    }
    @GetMapping("/count")
    public ResponseEntity<Long> countMyTransactions(Principal principal) {
        return ResponseEntity.ok(this.paymentTransactionService.countMyTransactions(principal.getName()));
    }
}
