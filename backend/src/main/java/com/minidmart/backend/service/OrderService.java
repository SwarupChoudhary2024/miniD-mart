package com.minidmart.backend.service;

import com.minidmart.backend.dto.OrderRequest;
import com.minidmart.backend.entity.Order;
import com.minidmart.backend.entity.OrderItem;
import com.minidmart.backend.entity.Product;
import com.minidmart.backend.entity.User;
import com.minidmart.backend.repository.OrderRepository;
import com.minidmart.backend.repository.ProductRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    public OrderService(
            OrderRepository orderRepository,
            ProductRepository productRepository) {

        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
    }

    // ==========================================
    // CUSTOMER - PLACE ORDER
    // ==========================================

    @Transactional
    public Order placeOrder(
            User user,
            OrderRequest request) {

        if (request == null ||
                request.getItems() == null ||
                request.getItems().isEmpty()) {

            throw new IllegalArgumentException(
                    "Cart is empty. Add at least one product."
            );
        }

        Order order = new Order();

        order.setUser(user);

        order.setOrderType(
                request.getOrderType()
        );

        order.setStatus("PENDING");

        order.setDeliveryAddress(
                request.getDeliveryAddress()
        );

        order.setPickupSlot(
                request.getPickupSlot()
        );

        order.setPaymentMethod(
                request.getPaymentMethod() == null ||
                request.getPaymentMethod().isBlank()
                        ? "COD"
                        : request.getPaymentMethod()
        );

        BigDecimal total = BigDecimal.ZERO;

        for (OrderRequest.OrderItemDto dto :
                request.getItems()) {

            if (dto.getProductId() == null ||
                    dto.getQuantity() == null ||
                    dto.getQuantity() <= 0) {

                throw new IllegalArgumentException(
                        "Invalid product or quantity."
                );
            }

            Product product =
                    productRepository.findById(
                            dto.getProductId()
                    ).orElseThrow(() ->
                            new IllegalArgumentException(
                                    "Product not found: "
                                            + dto.getProductId()
                            )
                    );

            int requestedQuantity =
                    dto.getQuantity();

            if (product.getStockQuantity() == null ||
                    product.getStockQuantity()
                            < requestedQuantity) {

                throw new IllegalArgumentException(
                        "Insufficient stock for: "
                                + product.getName()
                );
            }

            BigDecimal unitPrice =
                    product.getPrice();

            BigDecimal subtotal =
                    unitPrice.multiply(
                            BigDecimal.valueOf(
                                    requestedQuantity
                            )
                    );

            product.setStockQuantity(
                    product.getStockQuantity()
                            - requestedQuantity
            );

            productRepository.save(product);

            OrderItem item = new OrderItem();

            item.setProduct(product);
            item.setQuantity(requestedQuantity);
            item.setUnitPrice(unitPrice);
            item.setSubtotal(subtotal);

            order.addItem(item);

            total = total.add(subtotal);
        }

        order.setTotalAmount(total);

        return orderRepository.save(order);
    }

    // ==========================================
    // CUSTOMER - MY ORDERS
    // ==========================================

    public List<Order> getUserOrders(User user) {

        return orderRepository.findByUserId(
                user.getId()
        );
    }

    // ==========================================
    // ADMIN - ALL ORDERS
    // ==========================================

    public List<Order> getAllOrders() {

        return orderRepository.findAll();
    }

    // ==========================================
    // ADMIN - GET ORDER
    // ==========================================

    public Order getOrderById(Long orderId) {

        return orderRepository.findById(orderId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Order not found: "
                                        + orderId
                        )
                );
    }

    // ==========================================
    // ADMIN - UPDATE STATUS
    // ==========================================

    @Transactional
    public Order updateOrderStatus(
            Long orderId,
            String newStatus) {

        Order order =
                orderRepository.findById(orderId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Order not found"
                                )
                        );

        String status =
                newStatus.trim().toUpperCase();

        List<String> allowedStatuses =
                List.of(
                        "PENDING",
                        "PREPARING",
                        "DISPATCHED",
                        "DELIVERED",
                        "CANCELLED"
                );

        if (!allowedStatuses.contains(status)) {

            throw new IllegalArgumentException(
                    "Invalid order status: "
                            + status
            );
        }

        order.setStatus(status);

        return orderRepository.save(order);
    }
}