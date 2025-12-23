package com.gfos.domain;

public class Customer extends User {
    private final Cart cart;

    public Customer(String id, String name) {
        super(id, name, "Customer");
        this.cart = new Cart();
    }

    public Cart getCart() {
        return cart;
    }
}
