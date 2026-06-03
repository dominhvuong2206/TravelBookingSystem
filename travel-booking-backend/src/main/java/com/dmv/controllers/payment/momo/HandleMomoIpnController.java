package com.dmv.controllers.payment.momo;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
@RestController
@RequestMapping("/api/payments/momo/ipn")
public class HandleMomoIpnController extends MomoPaymentControllerSupport {
    @PostMapping
    public ResponseEntity<?> handle(@RequestBody Map<String, Object> body) {
        try {
            String secretKey = property("momo.secret.key");
            String accessKey = property("momo.access.key");
            String raw = "accessKey=" + accessKey + "&amount=" + body.get("amount")
                    + "&extraData=" + body.get("extraData") + "&message=" + body.get("message")
                    + "&orderId=" + body.get("orderId") + "&orderInfo=" + body.get("orderInfo")
                    + "&orderType=" + body.get("orderType") + "&partnerCode=" + body.get("partnerCode")
                    + "&payType=" + body.get("payType") + "&requestId=" + body.get("requestId")
                    + "&responseTime=" + body.get("responseTime") + "&resultCode=" + body.get("resultCode")
                    + "&transId=" + body.get("transId");
            String expected = hmacSHA256(secretKey, raw);
            if (!expected.equals(body.get("signature")))
                return ResponseEntity.ok(Map.of("status", "INVALID_SIGNATURE"));
            String orderId = body.get("orderId").toString();
            int bookingId = Integer.parseInt(orderId.split("-")[1]);
            String transId = body.get("transId") != null ? body.get("transId").toString() : orderId;
            if ("0".equals(body.get("resultCode").toString()))
                completePaidBooking(bookingId, transId);
            else
                failBookingPayment(bookingId, transId);
            return ResponseEntity.ok(Map.of("status", "OK"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}
