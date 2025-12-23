package com.gfos.data;

import com.gfos.domain.Menu;
import com.gfos.domain.Order;
import com.gfos.domain.User;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicInteger;

public class DatabaseGateway {
    private static final DatabaseGateway INSTANCE = new DatabaseGateway();

    private final List<User> users = new ArrayList<>();
    private final List<Menu> menus = new ArrayList<>();
    private final List<Order> orders = new ArrayList<>();
    private final AtomicInteger orderSequence = new AtomicInteger(1000);

    private DatabaseGateway() {
    }

    public static DatabaseGateway getInstance() {
        return INSTANCE;
    }

    public void saveUser(User user) {
        users.add(user);
    }

    public List<User> getUsers() {
        return Collections.unmodifiableList(users);
    }

    public void saveMenu(Menu menu) {
        menus.add(menu);
    }

    public List<Menu> getMenus() {
        return Collections.unmodifiableList(menus);
    }

    public void saveOrder(Order order) {
        orders.add(order);
    }

    public List<Order> getOrders() {
        return Collections.unmodifiableList(orders);
    }

    public void removeOrder(Order order) {
        orders.remove(order);
    }

    public int nextOrderNumber() {
        return orderSequence.incrementAndGet();
    }

    public Optional<Order> findOrderById(int id) {
        return orders.stream().filter(order -> order.getOrderId() == id).findFirst();
    }
}
