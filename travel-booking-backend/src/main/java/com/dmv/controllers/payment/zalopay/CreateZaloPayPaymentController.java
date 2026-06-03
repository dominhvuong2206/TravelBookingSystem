package com.dmv.controllers.payment.zalopay;
import com.dmv.pojo.Booking;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
@RestController
@RequestMapping("/api/secure/payments/zalopay/create")
public class CreateZaloPayPaymentController extends ZaloPayPaymentControllerSupport {
    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, Object> body) {
        int bookingId = 0;
        boolean payableBooking = false;
        try {
            bookingId = Integer.parseInt(body.get("bookingId").toString());
            Booking booking = requirePayableBooking(bookingId, "ZALOPAY");
            payableBooking = true;
            int appId = Integer.parseInt(property("zalopay.app.id", "2553"));
            long amount = amountOf(booking);
            long appTime = System.currentTimeMillis();
            String appUser = "travel_booking";
            String appTransId = new SimpleDateFormat("yyMMdd").format(new Date()) + "_" + bookingId + "_" + appTime;
            String redirectUrl = frontendUrl() + "/payment-return/zalopay/" + bookingId;
            String embedData = "{\"redirecturl\":\"" + redirectUrl + "\"}";
            String item = "[]";
            String description = "Travel Booking - " + booking.getServiceNameSnapshot();
            String callbackUrl = backendUrl() + "/api/payments/zalopay/callback";
            String key1 = property("zalopay.key1");
            String macData = appId + "|" + appTransId + "|" + appUser + "|" + amount + "|" + appTime + "|" + embedData + "|" + item;
            String mac = hmacSHA256(key1, macData);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
            params.add("app_id", String.valueOf(appId));
            params.add("app_user", appUser);
            params.add("app_time", String.valueOf(appTime));
            params.add("amount", String.valueOf(amount));
            params.add("app_trans_id", appTransId);
            params.add("embed_data", embedData);
            params.add("item", item);
            params.add("description", description);
            params.add("bank_code", "zalopayapp");
            params.add("callback_url", callbackUrl);
            params.add("mac", mac);
            ResponseEntity<Map> res = new RestTemplate().postForEntity(
                    property("zalopay.api.url"),
                    new HttpEntity<>(params, headers),
                    Map.class
            );
            Object orderUrl = res.getBody() != null ? res.getBody().get("order_url") : null;
            if (orderUrl == null) {
                failBookingPayment(bookingId, appTransId);
                Map<String, Object> errorBody = new LinkedHashMap<>();
                errorBody.put("error", zaloPayErrorMessage(res.getBody()));
                errorBody.put("detail", res.getBody());
                return ResponseEntity.status(502).body(errorBody);
            }
            return ResponseEntity.ok(Map.of("payUrl", orderUrl.toString(), "appTransId", appTransId));
        } catch (Exception e) {
            if (payableBooking)
                failBookingPayment(bookingId, null);
            return ResponseEntity.status(502).body(Map.of("error", e.getMessage()));
        }
    }
    private String zaloPayErrorMessage(Map body) {
        if (body != null) {
            Object subReturnMessage = body.get("sub_return_message");
            if (subReturnMessage != null && !subReturnMessage.toString().isBlank())
                return "ZaloPay: " + subReturnMessage;
            Object returnMessage = body.get("return_message");
            if (returnMessage != null && !returnMessage.toString().isBlank())
                return "ZaloPay: " + returnMessage;
        }
        return "ZaloPay không trả về link thanh toán.";
    }
}
