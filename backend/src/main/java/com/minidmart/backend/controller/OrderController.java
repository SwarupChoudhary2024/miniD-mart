package com.minidmart.backend.controller;

import com.minidmart.backend.dto.OrderRequest;
import com.minidmart.backend.entity.Order;
import com.minidmart.backend.service.OrderService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(
            OrderService orderService) {

        this.orderService = orderService;
    }

    // =========================================================
    // PLACE ORDER
    // POST /api/orders/{userId}
    // =========================================================

    @PostMapping("/{userId}")
    public ResponseEntity<Order> placeOrder(
            @PathVariable Long userId,
            @RequestBody OrderRequest request) {

        Order order =
                orderService.placeOrder(
                    userId,
                    request
                );

        return ResponseEntity.ok(order);
    }

    // =========================================================
    // GET USER ORDERS
    // GET /api/orders/user/{userId}
    // =========================================================

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Order>> getUserOrders(
            @PathVariable Long userId) {

        return ResponseEntity.ok(
            orderService.getUserOrders(userId)
        );
    }

    // =========================================================
    // UPDATE ORDER STATUS
    // PATCH /api/orders/{orderId}/status?status=CONFIRMED
    // =========================================================

    @PatchMapping("/{orderId}/status")
    public ResponseEntity<Order> updateStatus(
            @PathVariable Long orderId,
            @RequestParam String status) {

        return ResponseEntity.ok(
            orderService.updateOrderStatus(
                orderId,
                status
            )
        );
    }
}