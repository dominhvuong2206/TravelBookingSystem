package com.dmv.controllers.payment.zalopay;

import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/payments/zalopay/callback")
public class HandleZaloPayCallbackController extends ZaloPayPaymentControllerSupport {
    @PostMapping
    public ResponseEntity<?> handle(@RequestBody Map<String, Object> body) {
        try {
            String data = body.get("data").toString();
            String receivedMac = body.get("mac").toString();
            String expectedMac = hmacSHA256(property("zalopay.key2"), data);

            if (!expectedMac.equals(receivedMac))
                return ResponseEntity.ok(Map.of("return_code", -1, "return_message", "mac not equal"));

            String appTransId = extractAppTransId(data);
            if (appTransId != null) {
                String[] parts = appTransId.split("_");
                int bookingId = Integer.parseInt(parts[1]);
                completePaidBooking(bookingId, appTransId);
            }

            return ResponseEntity.ok(Map.of("return_code", 1, "return_message", "success"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("return_code", 0, "return_message", e.getMessage()));
        }
    }
}
