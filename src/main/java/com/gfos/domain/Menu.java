package com.gfos.domain;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class Menu {
    private final String id;
    private final String name;
    private final List<MenuItem> items;

    public Menu(String id, String name) {
        this.id = id;
        this.name = name;
        this.items = new ArrayList<>();
    }

    public void addItem(MenuItem item) {
        items.add(item);
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public List<MenuItem> getItems() {
        return Collections.unmodifiableList(items);
    }
}
