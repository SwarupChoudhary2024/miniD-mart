package com.minidmart.backend.controller;

import com.minidmart.backend.entity.Order;
import com.minidmart.backend.repository.OrderRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/staff")
@CrossOrigin(origins = "http://localhost:5173")
public class StaffOrderController {

    private final OrderRepository orderRepository;

    public StaffOrderController(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    // =====================================================
    // GET ALL ORDERS FOR STAFF
    // =====================================================

    @GetMapping("/orders")
    public ResponseEntity<List<Order>> getAllOrders() {

        List<Order> orders = orderRepository.findAll();

        return ResponseEntity.ok(orders);
    }

    // =====================================================
    // UPDATE ORDER STATUS
    // =====================================================

    @PutMapping("/orders/{id}/status")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Long id,
            @RequestBody StatusRequest request
    ) {

        Order order = orderRepository.findById(id)
                .orElse(null);

        if (order == null) {
            return ResponseEntity.notFound().build();
        }

        order.setStatus(request.getStatus());

        Order updatedOrder =
                orderRepository.save(order);

        return ResponseEntity.ok(updatedOrder);
    }

    // =====================================================
    // REQUEST CLASS
    // =====================================================

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