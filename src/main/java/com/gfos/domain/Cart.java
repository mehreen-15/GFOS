package com.gfos.domain;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class Cart {
    private final List<OrderItem> items = new ArrayList<>();

    public void addItem(MenuItem menuItem, int quantity) {
        items.add(new OrderItem(menuItem, quantity));
    }

    public List<OrderItem> getItems() {
        return Collections.unmodifiableList(items);
    }

    public void clear() {
        items.clear();
    }
}
