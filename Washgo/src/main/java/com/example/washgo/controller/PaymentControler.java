package com.example.washgo.controller;

import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.net.Webhook;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j; // Import Slf4j

import com.example.washgo.service.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/payment")
@Slf4j // Add SLF4J logging
public class PaymentControler {

    private final PaymentService paymentService;

    @Value("${stripe.webhook.secret}")
    private String endpointSecret;

//    @PostMapping("/create-payment-intent")
//    public Map<String, Object> createPaymentIntent(@RequestBody PaymentDTO paymentDTO) throws Exception {
//        PaymentIntent intent = paymentService.createPaymentIntent(paymentDTO);
//
//        Map<String, Object> response = new HashMap<>();
//        response.put("clientSecret", intent.getClientSecret());
//        return response;
//    }

    @PostMapping("/stripe-webhook")
    public ResponseEntity<String> handleStripeWebhook(@RequestBody String payload, @RequestHeader("Stripe-Signature") String sigHeader) {
        Event event;

        try {
            event = Webhook.constructEvent(payload, sigHeader, endpointSecret);
        } catch (SignatureVerificationException e) {
            log.error("⚠️ Webhook error: Invalid Stripe signature.", e); // Log exception
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid signature");
        } catch (Exception e) {
            log.error("⚠️ Webhook error: Could not parse payload.", e); // Log exception
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid payload");
        }

        PaymentIntent paymentIntent = null;
        switch (event.getType()) {
            case "payment_intent.succeeded":
                paymentIntent = (PaymentIntent) event.getDataObjectDeserializer().getObject().orElse(null);
                if (paymentIntent != null) {
                    log.info("Webhook received: payment_intent.succeeded for {}", paymentIntent.getId());
                    // --- Call the service to handle success ---
                    try {
                        paymentService.handlePaymentSuccess(paymentIntent);
                    } catch (Exception e) {
                        // Log error from service layer processing
                        log.error("Error processing successful payment webhook for {}: {}", paymentIntent.getId(), e.getMessage(), e);
                        // Return 500 to potentially let Stripe retry (depending on error type)
                        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error processing event");
                    }
                    // ------------------------------------------
                } else {
                    log.error("⚠️ Webhook error: Could not deserialize PaymentIntent for succeeded event.");
                }
                break;

            case "payment_intent.payment_failed":
                paymentIntent = (PaymentIntent) event.getDataObjectDeserializer().getObject().orElse(null);
                if (paymentIntent != null) {
                    log.info("Webhook received: payment_intent.payment_failed for {}", paymentIntent.getId());
                    // --- Call the service to handle failure ---
                    try {
                        paymentService.handlePaymentFailure(paymentIntent);
                    } catch (Exception e) {
                        // Log error from service layer processing
                        log.error("Error processing failed payment webhook for {}: {}", paymentIntent.getId(), e.getMessage(), e);
                        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error processing event");
                    }
                    // -----------------------------------------
                } else {
                    log.error("⚠️ Webhook error: Could not deserialize PaymentIntent for failed event.");
                }
                break;

            default:
                log.info("ℹ️ Unhandled webhook event type: {}", event.getType());
        }

        return ResponseEntity.ok("Webhook received successfully.");
    }
}