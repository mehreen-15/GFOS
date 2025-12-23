package com.gfos.presentation;

import com.gfos.data.DatabaseGateway;
import com.gfos.domain.CafeteriaStaff;
import com.gfos.domain.Customer;
import com.gfos.domain.Menu;
import com.gfos.domain.MenuItem;
import com.gfos.domain.Order;
import com.gfos.domain.OrderItem;
import com.gfos.domain.Payment;
import com.gfos.domain.PaymentGateway;

import com.sun.net.httpserver.Headers;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class CustomerInterface {
    private static final int PORT = 8080;
    private static final DatabaseGateway DATABASE = DatabaseGateway.getInstance();

    public static void main(String[] args) throws IOException {
        seedData();

        HttpServer server = HttpServer.create(new InetSocketAddress(PORT), 0);
        server.createContext("/", new StaticFileHandler());
        server.createContext("/api/menu", new MenuHandler());
        server.createContext("/api/order", new OrderHandler());
        server.createContext("/api/orders", new OrdersHandler());
        server.createContext("/api/orders/status", new StatusHandler());
        server.createContext("/api/orders/delete", new DeleteHandler());
        server.setExecutor(null);
        server.start();

        System.out.println("GFOS running at http://localhost:" + PORT);
    }

    private static void seedData() {
        Menu menu = new Menu("menu-1", "Campus Favorites");
        menu.addItem(new MenuItem("burger", "Classic Burger", "Mains",
            "Juicy beef patty with fresh vegetables", "🍔", 450));
        menu.addItem(new MenuItem("pizza", "Margherita Pizza", "Mains",
            "Traditional Italian pizza with mozzarella", "🍕", 850));
        menu.addItem(new MenuItem("salad", "Caesar Salad", "Salads",
            "Fresh romaine with parmesan and croutons", "🥗", 350));
        menu.addItem(new MenuItem("sandwich", "Club Sandwich", "Mains",
            "Triple-decker with turkey and bacon", "🥪", 500));
        menu.addItem(new MenuItem("pasta", "Pasta Carbonara", "Mains",
            "Creamy pasta with bacon and parmesan", "🍝", 650));
        menu.addItem(new MenuItem("soup", "Tomato Soup", "Soups",
            "Homemade creamy tomato soup", "🍲", 300));
        menu.addItem(new MenuItem("coffee", "Cappuccino", "Beverages",
            "Rich espresso with steamed milk", "☕", 250));
        menu.addItem(new MenuItem("juice", "Fresh Orange Juice", "Beverages",
            "Freshly squeezed oranges", "🧃", 200));
        menu.addItem(new MenuItem("cake", "Chocolate Cake", "Desserts",
            "Decadent chocolate layer cake", "🍰", 400));
        menu.addItem(new MenuItem("icecream", "Vanilla Ice Cream", "Desserts",
            "Premium vanilla bean ice cream", "🍨", 280));
        DATABASE.saveMenu(menu);

        DATABASE.saveUser(new Customer("cust-1", "Ayesha"));
        DATABASE.saveUser(new CafeteriaStaff("staff-1", "Sameer"));
    }

    private static void respondJson(HttpExchange exchange, int status, String body) throws IOException {
        byte[] response = body.getBytes(StandardCharsets.UTF_8);
        Headers headers = exchange.getResponseHeaders();
        headers.set("Content-Type", "application/json; charset=utf-8");
        headers.set("Access-Control-Allow-Origin", "*");
        exchange.sendResponseHeaders(status, response.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(response);
        }
    }

    private static void respondText(HttpExchange exchange, int status, String body, String contentType) throws IOException {
        byte[] response = body.getBytes(StandardCharsets.UTF_8);
        Headers headers = exchange.getResponseHeaders();
        headers.set("Content-Type", contentType + "; charset=utf-8");
        exchange.sendResponseHeaders(status, response.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(response);
        }
    }

    private static class StaticFileHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            String path = exchange.getRequestURI().getPath();
            if (path.equals("/")) {
                path = "/index.html";
            }

            String resourcePath = "/public" + path;
            try (InputStream input = CustomerInterface.class.getResourceAsStream(resourcePath)) {
                if (input != null) {
                    writeResponse(exchange, input.readAllBytes(), guessContentType(path));
                    return;
                }
            }

            Path filePath = Path.of("src/main/resources/public" + path).normalize();
            if (Files.exists(filePath) && !Files.isDirectory(filePath)) {
                byte[] bytes = Files.readAllBytes(filePath);
                writeResponse(exchange, bytes, guessContentType(path));
                return;
            }

            respondText(exchange, 404, "Not found", "text/plain");
        }

        private String guessContentType(String path) {
            if (path.endsWith(".css")) {
                return "text/css";
            }
            if (path.endsWith(".js")) {
                return "application/javascript";
            }
            if (path.endsWith(".svg")) {
                return "image/svg+xml";
            }
            return "text/html";
        }

        private void writeResponse(HttpExchange exchange, byte[] bytes, String contentType) throws IOException {
            exchange.getResponseHeaders().set("Content-Type", contentType + "; charset=utf-8");
            exchange.sendResponseHeaders(200, bytes.length);
            try (OutputStream os = exchange.getResponseBody()) {
                os.write(bytes);
            }
        }
    }

    private static class MenuHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (!"GET".equalsIgnoreCase(exchange.getRequestMethod())) {
                respondJson(exchange, 405, "{\"error\":\"Method not allowed\"}");
                return;
            }
            Menu menu = DATABASE.getMenus().get(0);
            StringBuilder itemsJson = new StringBuilder();
            for (MenuItem item : menu.getItems()) {
                if (itemsJson.length() > 0) {
                    itemsJson.append(",");
                }
                itemsJson.append(String.format(Locale.US,
                    "{\"id\":\"%s\",\"name\":\"%s\",\"category\":\"%s\",\"description\":\"%s\",\"image\":\"%s\",\"price\":%.2f}",
                    item.getId(), item.getName(), item.getCategory(), item.getDescription(), item.getImage(), item.getPrice()));
            }
            String response = String.format("{\"menu\":{\"id\":\"%s\",\"name\":\"%s\",\"items\":[%s]}}",
                menu.getId(), menu.getName(), itemsJson);
            respondJson(exchange, 200, response);
        }
    }

    private static class OrderHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                respondJson(exchange, 405, "{\"error\":\"Method not allowed\"}");
                return;
            }
            String body = new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8);
            OrderRequest request = OrderRequest.fromJson(body);
            if (request.items.isEmpty()) {
                respondJson(exchange, 400, "{\"error\":\"No items provided\"}");
                return;
            }

            Customer customer = new Customer("cust-" + System.currentTimeMillis(), request.customerName);
            List<OrderItem> orderItems = new ArrayList<>();
            for (OrderRequest.Item item : request.items) {
                Optional<MenuItem> menuItem = DATABASE.getMenus().get(0).getItems().stream()
                    .filter(menu -> menu.getId().equals(item.id))
                    .findFirst();
                if (menuItem.isPresent()) {
                    orderItems.add(new OrderItem(menuItem.get(), item.quantity));
                }
            }

            int orderId = DATABASE.nextOrderNumber();
            Order order = new Order(orderId, customer, request.customerEmail, request.notes, orderItems);
            order.addStatusListener((updatedOrder, newStatus) ->
                System.out.println("Order " + updatedOrder.getOrderId() + " status -> " + newStatus)
            );

            DATABASE.saveOrder(order);
            Payment payment = new Payment(order.getOrderId(), order.calculateTotal());
            payment.process(new DemoPaymentGateway());

            String response = String.format(Locale.US,
                "{\"orderId\":%d,\"status\":\"%s\",\"total\":%.2f,\"confirmation\":\"%s\"}",
                order.getOrderId(), order.getStatus(), order.calculateTotal(), payment.getConfirmationCode());
            respondJson(exchange, 200, response);
        }
    }

    private static class OrdersHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (!"GET".equalsIgnoreCase(exchange.getRequestMethod())) {
                respondJson(exchange, 405, "{\"error\":\"Method not allowed\"}");
                return;
            }
            StringBuilder ordersJson = new StringBuilder();
            for (Order order : DATABASE.getOrders()) {
                if (ordersJson.length() > 0) {
                    ordersJson.append(",");
                }
                ordersJson.append(buildOrderJson(order));
            }
            respondJson(exchange, 200, "{\"orders\":[" + ordersJson + "]}");
        }
    }

    private static class StatusHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                respondJson(exchange, 405, "{\"error\":\"Method not allowed\"}");
                return;
            }
            String body = new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8);
            Map<String, String> params = parseForm(body);
            String orderId = params.get("orderId");
            String status = params.get("status");
            if (orderId == null || status == null) {
                respondJson(exchange, 400, "{\"error\":\"orderId and status required\"}");
                return;
            }
            int id = Integer.parseInt(orderId);
            Optional<Order> order = DATABASE.findOrderById(id);
            if (order.isEmpty()) {
                respondJson(exchange, 404, "{\"error\":\"Order not found\"}");
                return;
            }
            order.get().updateStatus(status);
            respondJson(exchange, 200, "{\"ok\":true}");
        }
    }

    private static class DeleteHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                respondJson(exchange, 405, "{\"error\":\"Method not allowed\"}");
                return;
            }
            String body = new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8);
            Map<String, String> params = parseForm(body);
            String orderId = params.get("orderId");
            if (orderId == null) {
                respondJson(exchange, 400, "{\"error\":\"orderId required\"}");
                return;
            }
            int id = Integer.parseInt(orderId);
            Optional<Order> order = DATABASE.findOrderById(id);
            if (order.isEmpty()) {
                respondJson(exchange, 404, "{\"error\":\"Order not found\"}");
                return;
            }
            DATABASE.removeOrder(order.get());
            respondJson(exchange, 200, "{\"ok\":true}");
        }
    }

    private static class DemoPaymentGateway implements PaymentGateway {
        @Override
        public String charge(double amount, String reference) {
            return reference + "-CONFIRMED";
        }
    }

    private static class OrderRequest {
        private static final Pattern ITEM_PATTERN = Pattern.compile("\\{\\\"id\\\":\\\"(.*?)\\\",\\\"quantity\\\":(\\d+)\\}");
        private final String customerName;
        private final String customerEmail;
        private final String notes;
        private final List<Item> items;

        private OrderRequest(String customerName, String customerEmail, String notes, List<Item> items) {
            this.customerName = customerName;
            this.customerEmail = customerEmail;
            this.notes = notes;
            this.items = items;
        }

        private static OrderRequest fromJson(String json) {
            String name = extractField(json, "customerName");
            String email = extractField(json, "customerEmail");
            String notes = extractField(json, "notes");
            List<Item> items = new ArrayList<>();
            Matcher matcher = ITEM_PATTERN.matcher(json);
            while (matcher.find()) {
                items.add(new Item(matcher.group(1), Integer.parseInt(matcher.group(2))));
            }
            return new OrderRequest(name == null ? "Guest" : name,
                email == null ? "" : email,
                notes == null ? "" : notes,
                items);
        }

        private static String extractField(String json, String field) {
            Pattern pattern = Pattern.compile("\\\"" + Pattern.quote(field) + "\\\"\\s*:\\s*\\\"(.*?)\\\"");
            Matcher matcher = pattern.matcher(json);
            return matcher.find() ? matcher.group(1) : null;
        }

        private static class Item {
            private final String id;
            private final int quantity;

            private Item(String id, int quantity) {
                this.id = id;
                this.quantity = quantity;
            }
        }
    }

    private static Map<String, String> parseForm(String body) throws IOException {
        Map<String, String> params = new HashMap<>();
        for (String pair : body.split("&")) {
            if (pair.isBlank()) {
                continue;
            }
            String[] parts = pair.split("=", 2);
            String key = URLDecoder.decode(parts[0], StandardCharsets.UTF_8);
            String value = parts.length > 1
                ? URLDecoder.decode(parts[1], StandardCharsets.UTF_8)
                : "";
            params.put(key, value);
        }
        return params;
    }

    private static String buildOrderJson(Order order) {
        StringBuilder itemsJson = new StringBuilder();
        for (OrderItem item : order.getItems()) {
            if (itemsJson.length() > 0) {
                itemsJson.append(",");
            }
            MenuItem menuItem = item.getMenuItem();
            itemsJson.append(String.format(Locale.US,
                "{\"id\":\"%s\",\"name\":\"%s\",\"price\":%.2f,\"quantity\":%d}",
                menuItem.getId(), menuItem.getName(), menuItem.getPrice(), item.getQuantity()));
        }
        return String.format(Locale.US,
            "{\"orderId\":%d,\"customerName\":\"%s\",\"customerEmail\":\"%s\",\"items\":[%s],\"total\":%.2f,\"status\":\"%s\",\"orderDate\":\"%s\",\"notes\":\"%s\"}",
            order.getOrderId(),
            order.getCustomer().getName(),
            order.getCustomerEmail(),
            itemsJson,
            order.calculateTotal(),
            order.getStatus(),
            DateTimeFormatter.ISO_INSTANT.format(order.getCreatedAt()),
            order.getNotes());
    }
}
