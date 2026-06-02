package com.dmv.controllers.payment.stripe;

import com.dmv.controllers.payment.BasePaymentControllerSupport;
import com.stripe.Stripe;

public abstract class StripePaymentControllerSupport extends BasePaymentControllerSupport {
    protected void initStripe() {
        Stripe.apiKey = property("stripe.secret.key");
    }
}
