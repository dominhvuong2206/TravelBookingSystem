package com.dmv.utils;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.JWSSigner;
import com.nimbusds.jose.JWSVerifier;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.PropertySource;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

@Component
@PropertySource("classpath:configs.properties")
public class JwtUtils {
    private static final int MIN_SECRET_BYTES = 32;
    private final byte[] secret;
    private final long expirationMs;

    @Autowired
    public JwtUtils(Environment env) {
        this(config(env, "jwt.secret"), expiration(env));
    }

    JwtUtils(String secret, long expirationMs) {
        if (secret == null || secret.getBytes(StandardCharsets.UTF_8).length < MIN_SECRET_BYTES)
            throw new IllegalStateException("JWT_SECRET must contain at least 32 UTF-8 bytes.");
        if (expirationMs <= 0)
            throw new IllegalStateException("JWT_EXPIRATION_MS must be greater than zero.");
        this.secret = secret.getBytes(StandardCharsets.UTF_8);
        this.expirationMs = expirationMs;
    }

    public String generateToken(String username) throws Exception {
        JWSSigner signer = new MACSigner(secret);
        JWTClaimsSet claimsSet = new JWTClaimsSet.Builder()
                .subject(username)
                .expirationTime(new Date(System.currentTimeMillis() + expirationMs))
                .issueTime(new Date())
                .build();
        SignedJWT signedJWT = new SignedJWT(
                new JWSHeader(JWSAlgorithm.HS256),
                claimsSet
        );
        signedJWT.sign(signer);
        return signedJWT.serialize();
    }

    public String validateTokenAndGetUsername(String token) throws Exception {
        SignedJWT signedJWT = SignedJWT.parse(token);
        JWSVerifier verifier = new MACVerifier(secret);
        if (signedJWT.verify(verifier)) {
            Date expiration = signedJWT.getJWTClaimsSet().getExpirationTime();
            if (expiration != null && expiration.after(new Date())) {
                return signedJWT.getJWTClaimsSet().getSubject();
            }
        }
        return null;
    }

    private static long expiration(Environment env) {
        String raw = config(env, "jwt.expiration_ms");
        return raw == null || raw.isBlank() ? 86_400_000L : Long.parseLong(raw);
    }

    private static String config(Environment env, String name) {
        String value = System.getenv(name.toUpperCase().replace('.', '_'));
        if (value == null || value.isBlank())
            value = env.getProperty(name);
        return value;
    }
}
