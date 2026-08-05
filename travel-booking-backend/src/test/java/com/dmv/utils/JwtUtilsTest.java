package com.dmv.utils;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.Test;

class JwtUtilsTest {
    private static final String SECRET = "0123456789abcdef0123456789abcdef";

    @Test
    void generatedTokenCanBeValidated() throws Exception {
        JwtUtils jwtUtils = new JwtUtils(SECRET, 60_000);

        String token = jwtUtils.generateToken("customer");

        assertEquals("customer", jwtUtils.validateTokenAndGetUsername(token));
    }

    @Test
    void tokenSignedWithAnotherSecretIsRejected() throws Exception {
        JwtUtils issuer = new JwtUtils(SECRET, 60_000);
        JwtUtils verifier = new JwtUtils("abcdef0123456789abcdef0123456789", 60_000);

        assertNull(verifier.validateTokenAndGetUsername(issuer.generateToken("customer")));
    }

    @Test
    void expiredTokenIsRejected() throws Exception {
        JwtUtils jwtUtils = new JwtUtils(SECRET, 1);
        String token = jwtUtils.generateToken("customer");
        Thread.sleep(5);

        assertNull(jwtUtils.validateTokenAndGetUsername(token));
    }

    @Test
    void shortSecretFailsFast() {
        assertThrows(IllegalStateException.class, () -> new JwtUtils("too-short", 60_000));
    }
}
