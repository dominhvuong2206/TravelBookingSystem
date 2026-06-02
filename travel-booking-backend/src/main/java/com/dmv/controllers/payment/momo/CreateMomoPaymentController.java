package com.dmv.controllers.payment.momo;

import com.dmv.pojo.Booking;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("/api/secure/payments/momo/create")
public class CreateMomoPaymentController extends MomoPaymentControllerSupport {
    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, Object> body) {
        try {
            int bookingId = Integer.parseInt(body.get("bookingId").toString());
            Booking booking = requirePayableBooking(bookingId, "MOMO");
            long amount = amountOf(booking);

            String partnerCode = property("momo.partner.code", "MOMO");
            String accessKey = property("momo.access.key");
            String secretKey = property("momo.secret.key");
            String requestId = partnerCode + System.currentTimeMillis();
            String orderId = "TRAVEL-" + bookingId + "-" + System.currentTimeMillis();
            String orderInfo = "Thanh toan dich vu: " + booking.getServiceNameSnapshot();
            String redirectUrl = frontendUrl() + "/payment-return/momo/" + bookingId;
            String ipnUrl = backendUrl() + "/api/payments/momo/ipn";
            String extraData = "";
            String requestType = "payWithMethod";

            String raw = "accessKey=" + accessKey + "&amount=" + amount + "&extraData=" + extraData
                    + "&ipnUrl=" + ipnUrl + "&orderId=" + orderId + "&orderInfo=" + orderInfo
                    + "&partnerCode=" + partnerCode + "&redirectUrl=" + redirectUrl
                    + "&requestId=" + requestId + "&requestType=" + requestType;
            String signature = hmacSHA256(secretKey, raw);

            Map<String, Object> req = new LinkedHashMap<>();
            req.put("partnerCode", partnerCode);
            req.put("accessKey", accessKey);
            req.put("requestId", requestId);
            req.put("amount", amount);
            req.put("orderId", orderId);
            req.put("orderInfo", orderInfo);
            req.put("redirectUrl", redirectUrl);
            req.put("ipnUrl", ipnUrl);
            req.put("extraData", extraData);
            req.put("requestType", requestType);
            req.put("signature", signature);
            req.put("lang", "vi");

            ResponseEntity<Map> res = new RestTemplate().postForEntity(property("momo.api.url"), req, Map.class);
            Object payUrl = res.getBody() != null ? res.getBody().get("payUrl") : null;
            if (payUrl == null)
                return ResponseEntity.status(502).body(Map.of("error", "MoMo không trả về link thanh toán.", "detail", res.getBody()));

            return ResponseEntity.ok(Map.of("payUrl", payUrl.toString(), "orderId", orderId));
        } catch (Exception e) {
            return ResponseEntity.status(502).body(Map.of("error", e.getMessage()));
        }
    }
}
