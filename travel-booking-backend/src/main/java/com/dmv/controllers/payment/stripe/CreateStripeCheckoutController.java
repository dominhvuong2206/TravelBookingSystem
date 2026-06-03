package com.dmv.controllers.payment.stripe;
import com.dmv.pojo.Booking;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/secure/payments/stripe/create")
public class CreateStripeCheckoutController extends StripePaymentControllerSupport {
    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, Object> body) {
        int bookingId = 0;
        boolean payableBooking = false;
        try {
            initStripe();
            bookingId = Integer.parseInt(body.get("bookingId").toString());
            Booking booking = requirePayableBooking(bookingId, "STRIPE");
            payableBooking = true;
            SessionCreateParams params = SessionCreateParams.builder()
                    .setMode(SessionCreateParams.Mode.PAYMENT)
                    .setSuccessUrl(frontendUrl() + "/payment-return/stripe/" + bookingId + "?session_id={CHECKOUT_SESSION_ID}")
                    .setCancelUrl(frontendUrl() + "/my-payments")
                    .putMetadata("bookingId", String.valueOf(bookingId))
                    .addPaymentMethodType(SessionCreateParams.PaymentMethodType.CARD)
                    .addLineItem(SessionCreateParams.LineItem.builder()
                            .setQuantity(1L)
                            .setPriceData(SessionCreateParams.LineItem.PriceData.builder()
                                    .setCurrency("vnd")
                                    .setUnitAmount(amountOf(booking))
                                    .setProductData(SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                            .setName(booking.getServiceNameSnapshot())
                                            .build())
                                    .build())
                            .build())
                    .build();
            Session session = Session.create(params);
            return ResponseEntity.ok(Map.of("payUrl", session.getUrl(), "sessionId", session.getId()));
        } catch (StripeException e) {
            if (payableBooking)
                failBookingPayment(bookingId, null);
            return ResponseEntity.status(502).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            if (payableBooking)
                failBookingPayment(bookingId, null);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
