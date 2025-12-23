package com.gfos.domain;

public class MenuItem {
    private final String id;
    private final String name;
    private final String category;
    private final String description;
    private final String image;
    private final double price;

    public MenuItem(String id, String name, String category, String description, String image, double price) {
        this.id = id;
        this.name = name;
        this.category = category;
        this.description = description;
        this.image = image;
        this.price = price;
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getCategory() {
        return category;
    }

    public String getDescription() {
        return description;
    }

    public String getImage() {
        return image;
    }

    public double getPrice() {
        return price;
    }
}
