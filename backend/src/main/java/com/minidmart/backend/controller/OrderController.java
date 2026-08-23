package com.minidmart.backend.controller;

import com.minidmart.backend.dto.AdminOrderResponse;
import com.minidmart.backend.dto.OrderRequest;
import com.minidmart.backend.entity.Order;
import com.minidmart.backend.entity.User;
import com.minidmart.backend.service.OrderService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    // =========================================
    // CUSTOMER - PLACE ORDER
    // =========================================

    @PostMapping
    public ResponseEntity<Order> placeOrder(
            Authentication authentication,
            @RequestBody OrderRequest request
    ) {

        User user =
                (User) authentication.getPrincipal();

        return ResponseEntity.ok(
                orderService.placeOrder(user, request)
        );
    }

    // =========================================
    // CUSTOMER - MY ORDERS
    // =========================================

    @GetMapping("/my")
    public ResponseEntity<List<Order>> getMyOrders(
            Authentication authentication
    ) {

        User user =
                (User) authentication.getPrincipal();

        return ResponseEntity.ok(
                orderService.getUserOrders(user)
        );
    }
}