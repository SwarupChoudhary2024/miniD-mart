package com.minidmart.backend.controller;

import com.minidmart.backend.dto.OrderRequest;
import com.minidmart.backend.entity.Order;
import com.minidmart.backend.entity.User;
import com.minidmart.backend.service.OrderService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Orders of the logged-in user (customer, staff or admin). */
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    // PLACE ORDER
    @PostMapping
    public ResponseEntity<Order> placeOrder(
            Authentication authentication,
            @RequestBody OrderRequest request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(orderService.placeOrder(currentUser(authentication), request));
    }

    // MY ORDERS (newest first)
    @GetMapping("/my")
    public List<Order> getMyOrders(Authentication authentication) {
        return orderService.getUserOrders(currentUser(authentication));
    }

    // ONE ORDER (own order; staff/admin may open any)
    @GetMapping("/{id}")
    public Order getOrder(@PathVariable Long id, Authentication authentication) {
        boolean privileged = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN")
                        || a.getAuthority().equals("ROLE_STAFF"));
        return orderService.getOrderForUser(currentUser(authentication), id, privileged);
    }

    // CANCEL MY PENDING ORDER (stock is returned)
    @PatchMapping("/{id}/cancel")
    public Order cancelMyOrder(@PathVariable Long id, Authentication authentication) {
        return orderService.cancelMyOrder(currentUser(authentication), id);
    }

    private User currentUser(Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof User user) {
            return user;
        }
        throw new BadCredentialsException("Not logged in");
    }
}
