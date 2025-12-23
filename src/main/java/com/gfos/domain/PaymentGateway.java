package com.gfos.domain;

public interface PaymentGateway {
    String charge(double amount, String reference);
}
