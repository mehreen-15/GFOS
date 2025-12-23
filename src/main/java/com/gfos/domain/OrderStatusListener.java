package com.gfos.domain;

public interface OrderStatusListener {
    void onStatusChanged(Order order, String newStatus);
}
