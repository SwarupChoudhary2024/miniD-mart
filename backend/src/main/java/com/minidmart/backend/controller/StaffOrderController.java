package com.minidmart.backend.controller;

import com.minidmart.backend.entity.Order;
import com.minidmart.backend.service.OrderService;

import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Order handling for the Staff dashboard (ROLE_STAFF, admins allowed too). */
@RestController
@RequestMapping("/api/staff")
public class StaffOrderController {

    private final OrderService orderService;

    public StaffOrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping("/orders")
    public List<Order> getAllOrders() {
        return orderService.getAllOrders();
    }

    // PUT /api/staff/orders/{id}/status   body: { "status": "PREPARING" }
    @PutMapping("/orders/{id}/status")
    public Order updateOrderStatus(
            @PathVariable Long id,
            @RequestBody StatusRequest request) {

        return orderService.updateOrderStatus(id, request == null ? null : request.getStatus());
    }

    public static class StatusRequest {

        private String status;

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }
    }
}
