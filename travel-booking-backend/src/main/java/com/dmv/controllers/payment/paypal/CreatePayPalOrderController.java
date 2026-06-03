package com.dmv.controllers.payment.paypal;
import com.dmv.pojo.Booking;
import java.util.List;
import java.util.Map;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
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
@RequestMapping("/api/secure/payments/paypal/create")
public class CreatePayPalOrderController extends PayPalPaymentControllerSupport {
    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, Object> body) {
        int bookingId = 0;
        boolean payableBooking = false;
        try {
            bookingId = Integer.parseInt(body.get("bookingId").toString());
            Booking booking = requirePayableBooking(bookingId, "PAYPAL");
            payableBooking = true;
            String clientId = property("paypal.client.id");
            String clientSecret = property("paypal.client.secret");
            RestTemplate rest = new RestTemplate();
            HttpHeaders tokenHeaders = new HttpHeaders();
            tokenHeaders.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            tokenHeaders.set("Authorization", "Basic " + basicAuth(clientId, clientSecret));
            MultiValueMap<String, String> tokenBody = new LinkedMultiValueMap<>();
            tokenBody.add("grant_type", "client_credentials");
            ResponseEntity<Map<String, Object>> tokenRes = rest.exchange(
                    paypalApiBase() + "/v1/oauth2/token",
                    HttpMethod.POST,
                    new HttpEntity<>(tokenBody, tokenHeaders),
                    new ParameterizedTypeReference<Map<String, Object>>() {});
            String accessToken = (String) tokenRes.getBody().get("access_token");
            HttpHeaders orderHeaders = new HttpHeaders();
            orderHeaders.setContentType(MediaType.APPLICATION_JSON);
            orderHeaders.set("Authorization", "Bearer " + accessToken);
            Map<String, Object> orderBody = Map.of(
                    "intent", "CAPTURE",
                    "purchase_units", List.of(Map.of(
                            "custom_id", String.valueOf(bookingId),
                            "description", booking.getServiceNameSnapshot(),
                            "amount", Map.of("currency_code", "USD", "value", usdAmount(amountOf(booking)))
                    )),
                    "application_context", Map.of(
                            "return_url", frontendUrl() + "/payment-return/paypal/" + bookingId,
                            "cancel_url", frontendUrl() + "/my-payments",
                            "brand_name", "Travel Booking",
                            "user_action", "PAY_NOW"
                    )
            );
            ResponseEntity<Map<String, Object>> orderRes = rest.exchange(
                    paypalApiBase() + "/v2/checkout/orders",
                    HttpMethod.POST,
                    new HttpEntity<>(orderBody, orderHeaders),
                    new ParameterizedTypeReference<Map<String, Object>>() {});
            List<Map<String, String>> links = (List<Map<String, String>>) orderRes.getBody().get("links");
            String payUrl = links.stream()
                    .filter(link -> "approve".equals(link.get("rel")))
                    .findFirst()
                    .map(link -> link.get("href"))
                    .orElse(null);
            if (payUrl == null) {
                failBookingPayment(bookingId, null);
                return ResponseEntity.status(502).body(Map.of("error", "PayPal không trả về link thanh toán."));
            }
            return ResponseEntity.ok(Map.of("payUrl", payUrl, "orderId", orderRes.getBody().get("id")));
        } catch (Exception e) {
            if (payableBooking)
                failBookingPayment(bookingId, null);
            return ResponseEntity.status(502).body(Map.of("error", e.getMessage()));
        }
    }
}
