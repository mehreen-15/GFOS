package com.gfos.domain;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class Order {
    private final int orderId;
    private final Customer customer;
    private final String customerEmail;
    private final String notes;
    private final List<OrderItem> items;
    private final Instant createdAt;
    private final List<OrderStatusListener> statusListeners;
    private String status;

    public Order(int orderId, Customer customer, String customerEmail, String notes, List<OrderItem> items) {
        this.orderId = orderId;
        this.customer = customer;
        this.customerEmail = customerEmail;
        this.notes = notes;
        this.items = new ArrayList<>(items);
        this.createdAt = Instant.now();
        this.status = "pending";
        this.statusListeners = new ArrayList<>();
    }

    public int getOrderId() {
        return orderId;
    }

    public Customer getCustomer() {
        return customer;
    }

    public String getCustomerEmail() {
        return customerEmail;
    }

    public String getNotes() {
        return notes;
    }

    public List<OrderItem> getItems() {
        return Collections.unmodifiableList(items);
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public String getStatus() {
        return status;
    }

    public void addStatusListener(OrderStatusListener listener) {
        statusListeners.add(listener);
    }

    public double calculateTotal() {
        return items.stream().mapToDouble(OrderItem::getLineTotal).sum();
    }

    public void updateStatus(String newStatus) {
        this.status = newStatus;
        for (OrderStatusListener listener : statusListeners) {
            listener.onStatusChanged(this, newStatus);
        }
    }
}
