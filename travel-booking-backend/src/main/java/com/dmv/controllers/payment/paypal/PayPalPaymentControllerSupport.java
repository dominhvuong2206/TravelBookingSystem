package com.dmv.controllers.payment.paypal;
import com.dmv.controllers.payment.BasePaymentControllerSupport;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.List;
import java.util.Map;
public abstract class PayPalPaymentControllerSupport extends BasePaymentControllerSupport {
    protected String paypalApiBase() {
        return property("paypal.api.base", "https://api-m.sandbox.paypal.com");
    }
    protected String basicAuth(String clientId, String clientSecret) {
        return Base64.getEncoder().encodeToString((clientId + ":" + clientSecret).getBytes(StandardCharsets.UTF_8));
    }
    protected String usdAmount(long amountVnd) {
        double rate = Double.parseDouble(property("paypal.vnd.to.usd", "25000"));
        return String.format(java.util.Locale.US, "%.2f", amountVnd / rate);
    }
    protected Integer extractBookingId(Map<String, Object> captureData) {
        Object purchaseUnitsObj = captureData.get("purchase_units");
        if (!(purchaseUnitsObj instanceof List<?> purchaseUnits) || purchaseUnits.isEmpty())
            return null;
        Object unitObj = purchaseUnits.get(0);
        if (!(unitObj instanceof Map<?, ?> unit))
            return null;
        Object customId = unit.get("custom_id");
        return customId == null ? null : Integer.parseInt(customId.toString());
    }
}
