package com.dmv.controllers.payment.zalopay;
import com.dmv.controllers.payment.BasePaymentControllerSupport;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

public abstract class ZaloPayPaymentControllerSupport extends BasePaymentControllerSupport {
    private final ObjectMapper mapper = new ObjectMapper();
    protected String hmacSHA256(String key, String data) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        byte[] bytes = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        StringBuilder builder = new StringBuilder();
        for (byte b : bytes)
            builder.append(String.format("%02x", b));
        return builder.toString();
    }
    protected String extractAppTransId(String data) throws Exception {
        if (data == null || data.isBlank())
            return null;
        Map<String, Object> parsed = mapper.readValue(data, new TypeReference<Map<String, Object>>() {});
        Object appTransId = parsed.get("app_trans_id");
        return appTransId == null ? null : appTransId.toString();
    }
}
