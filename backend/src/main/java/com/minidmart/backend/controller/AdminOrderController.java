package com.minidmart.backend.controller;

import com.minidmart.backend.entity.Order;
import com.minidmart.backend.service.OrderService;

import org.springframework.web.bind.annotation.*;

import java.util.List;

/** All orders + status changes for the Admin dashboard (ROLE_ADMIN). */
@RestController
@RequestMapping("/api/admin/orders")
public class AdminOrderController {

    private final OrderService orderService;

    public AdminOrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping
    public List<Order> getAllOrders() {
        return orderService.getAllOrders();
    }

    // PATCH /api/admin/orders/{id}/status?status=DISPATCHED
    @PatchMapping("/{orderId}/status")
    public Order updateOrderStatus(
            @PathVariable Long orderId,
            @RequestParam String status) {

        return orderService.updateOrderStatus(orderId, status);
    }
}
