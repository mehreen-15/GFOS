# GFOS

A lightweight Java + HTML/CSS/JS implementation of the Gulberg Food Ordering System (GFOS) with layered architecture and design pattern-ready domain classes.

## Quick start

```bash
javac -d out $(find src/main/java -name "*.java")
java -cp out com.gfos.presentation.CustomerInterface
```

Then open [http://localhost:8080](http://localhost:8080).

## Architecture notes

- **Presentation layer**: `com.gfos.presentation.CustomerInterface` serves the UI and API endpoints.
- **Domain layer**: user hierarchy, menus, cart, orders, and payments.
- **Data layer**: `DatabaseGateway` singleton simulates persistence.

## Design patterns (conceptual + code)

| Pattern | Where |
| --- | --- |
| Singleton | `com.gfos.data.DatabaseGateway` |
| Factory-ready User hierarchy | `com.gfos.domain.User` subclasses |
| Strategy-ready pricing | `com.gfos.domain.Order#calculateTotal()` |
| Observer-ready order status | `com.gfos.domain.Order#updateStatus()` + `OrderStatusListener` |
| Adapter-ready payment | `com.gfos.domain.Payment#process()` + `PaymentGateway` |
