package com.minidmart.backend.controller;

import com.minidmart.backend.entity.Order;
import com.minidmart.backend.repository.OrderRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/orders")
public class AdminOrderController {

    private final OrderRepository orderRepository;

    public AdminOrderController(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    // =====================================================
    // GET ALL ORDERS
    // =====================================================

    @GetMapping
    public ResponseEntity<List<Order>> getAllOrders() {

        List<Order> orders = orderRepository.findAll();

        return ResponseEntity.ok(orders);
    }


    // =====================================================
    // UPDATE ORDER STATUS
    // =====================================================

    @PatchMapping("/{orderId}/status")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestParam String status
    ) {

        Order order = orderRepository.findById(orderId)
                .orElse(null);

        if (order == null) {
            return ResponseEntity
                    .badRequest()
                    .body("Order not found");
        }

        order.setStatus(status.toUpperCase());

        Order updatedOrder =
                orderRepository.save(order);

        return ResponseEntity.ok(updatedOrder);
    }
}