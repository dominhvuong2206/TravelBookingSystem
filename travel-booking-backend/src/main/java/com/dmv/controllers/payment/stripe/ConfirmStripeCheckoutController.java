package com.dmv.controllers.payment.stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
@RestController
@RequestMapping("/api/secure/payments/stripe/confirm")
public class ConfirmStripeCheckoutController extends StripePaymentControllerSupport {
    @PostMapping
    public ResponseEntity<?> confirm(@RequestBody Map<String, Object> body) {
        try {
            initStripe();
            String sessionId = body.get("sessionId").toString();
            Session session = Session.retrieve(sessionId);
            String status = session.getPaymentStatus();
            if ("paid".equalsIgnoreCase(status)) {
                String bookingId = session.getMetadata().get("bookingId");
                completePaidBooking(Integer.parseInt(bookingId), session.getPaymentIntent());
            }
            return ResponseEntity.ok(Map.of("status", status));
        } catch (StripeException e) {
            return ResponseEntity.status(502).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
