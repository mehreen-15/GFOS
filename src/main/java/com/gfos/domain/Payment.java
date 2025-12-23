package com.gfos.domain;

import java.time.Instant;

public class Payment {
    private final int orderId;
    private final double amount;
    private final Instant processedAt;
    private String confirmationCode;

    public Payment(int orderId, double amount) {
        this.orderId = orderId;
        this.amount = amount;
        this.processedAt = Instant.now();
    }

    public int getOrderId() {
        return orderId;
    }

    public double getAmount() {
        return amount;
    }

    public Instant getProcessedAt() {
        return processedAt;
    }

    public String getConfirmationCode() {
        return confirmationCode;
    }

    public void process(PaymentGateway gateway) {
        this.confirmationCode = gateway.charge(amount, "ORDER-" + orderId);
    }
}
