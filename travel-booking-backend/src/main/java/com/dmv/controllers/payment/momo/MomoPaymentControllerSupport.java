package com.dmv.controllers.payment.momo;
import com.dmv.controllers.payment.BasePaymentControllerSupport;
import java.nio.charset.StandardCharsets;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

public abstract class MomoPaymentControllerSupport extends BasePaymentControllerSupport {
    protected String hmacSHA256(String key, String data) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        byte[] bytes = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        StringBuilder builder = new StringBuilder();
        for (byte b : bytes)
            builder.append(String.format("%02x", b));
        return builder.toString();
    }
}
