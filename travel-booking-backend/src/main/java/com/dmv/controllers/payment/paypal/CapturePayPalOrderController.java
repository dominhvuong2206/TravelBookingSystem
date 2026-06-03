package com.dmv.controllers.payment.paypal;
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
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.client.RestTemplate;
@RestController
@RequestMapping("/api/secure/payments/paypal/capture")
public class CapturePayPalOrderController extends PayPalPaymentControllerSupport {
    @PostMapping
    public ResponseEntity<?> capture(@RequestBody Map<String, Object> body) {
        try {
            String paypalOrderId = body.get("paypalOrderId").toString();
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
            HttpHeaders captureHeaders = new HttpHeaders();
            captureHeaders.setContentType(MediaType.APPLICATION_JSON);
            captureHeaders.set("Authorization", "Bearer " + accessToken);
            ResponseEntity<Map<String, Object>> captureRes = rest.exchange(
                    paypalApiBase() + "/v2/checkout/orders/" + paypalOrderId + "/capture",
                    HttpMethod.POST,
                    new HttpEntity<>(Map.of(), captureHeaders),
                    new ParameterizedTypeReference<Map<String, Object>>() {});
            Map<String, Object> captureData = captureRes.getBody();
            String status = captureData != null ? (String) captureData.get("status") : "UNKNOWN";
            if ("COMPLETED".equalsIgnoreCase(status)) {
                Integer bookingId = extractBookingId(captureData);
                if (bookingId != null)
                    completePaidBooking(bookingId, paypalOrderId);
            }
            return ResponseEntity.ok(Map.of("status", status));
        } catch (RestClientResponseException e) {
            if (e.getResponseBodyAsString() != null && e.getResponseBodyAsString().contains("ORDER_ALREADY_CAPTURED")) {
                Object bookingId = body.get("bookingId");
                if (bookingId != null)
                    completePaidBooking(Integer.parseInt(bookingId.toString()), body.get("paypalOrderId").toString());
                return ResponseEntity.ok(Map.of("status", "COMPLETED", "alreadyCaptured", true));
            }
            return ResponseEntity.status(502).body(Map.of("error", e.getResponseBodyAsString()));
        } catch (Exception e) {
            return ResponseEntity.status(502).body(Map.of("error", e.getMessage()));
        }
    }
}
