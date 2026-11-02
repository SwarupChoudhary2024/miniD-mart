package com.minidmart.backend.service;

import com.minidmart.backend.dto.OrderRequest;
import com.minidmart.backend.entity.Order;
import com.minidmart.backend.entity.OrderItem;
import com.minidmart.backend.entity.Product;
import com.minidmart.backend.entity.User;
import com.minidmart.backend.exception.ResourceNotFoundException;
import com.minidmart.backend.repository.OrderRepository;
import com.minidmart.backend.repository.ProductRepository;
import com.minidmart.backend.repository.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;

@Service
public class OrderService {

    /** Statuses used by the customer, staff and admin screens. */
    public static final Set<String> ALLOWED_STATUSES = Set.of(
            "PENDING", "PREPARING", "READY", "DISPATCHED",
            "DELIVERED", "COMPLETED", "CANCELLED");

    private static final Set<String> ORDER_TYPES = Set.of("DELIVERY", "PICKUP");
    private static final Set<String> PAYMENT_METHODS = Set.of("COD", "UPI", "CARD");
    private static final Set<String> FINISHED_STATUSES = Set.of("DELIVERED", "COMPLETED");

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public OrderService(
            OrderRepository orderRepository,
            ProductRepository productRepository,
            UserRepository userRepository) {

        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    // ==========================================
    // CUSTOMER - PLACE ORDER
    // ==========================================

    @Transactional
    public Order placeOrder(User principal, OrderRequest request) {

        if (request == null || request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalArgumentException("Cart is empty. Add at least one product.");
        }

        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User account not found."));

        // ---- order type ----
        String orderType = request.getOrderType() == null || request.getOrderType().isBlank()
                ? "DELIVERY"
                : request.getOrderType().trim().toUpperCase();
        if (!ORDER_TYPES.contains(orderType)) {
            throw new IllegalArgumentException("Order type must be DELIVERY or PICKUP.");
        }

        String address = trimToNull(request.getDeliveryAddress());
        String slot = trimToNull(request.getPickupSlot());

        if ("DELIVERY".equals(orderType) && address == null) {
            throw new IllegalArgumentException("Delivery address is required for home delivery.");
        }
        if ("PICKUP".equals(orderType) && slot == null) {
            throw new IllegalArgumentException("Please choose a pickup slot.");
        }

        // ---- payment ----
        String payment = request.getPaymentMethod() == null || request.getPaymentMethod().isBlank()
                ? "COD"
                : request.getPaymentMethod().trim().toUpperCase();
        if (!PAYMENT_METHODS.contains(payment)) {
            throw new IllegalArgumentException("Unsupported payment method: " + payment);
        }

        // ---- merge duplicate lines; sorted by id so row locks are always taken in
        //      the same order (prevents deadlocks between two simultaneous orders) ----
        Map<Long, Integer> wanted = new TreeMap<>();
        for (OrderRequest.OrderItemDto dto : request.getItems()) {
            if (dto == null || dto.getProductId() == null
                    || dto.getQuantity() == null || dto.getQuantity() <= 0) {
                throw new IllegalArgumentException("Invalid product or quantity.");
            }
            wanted.merge(dto.getProductId(), dto.getQuantity(), Integer::sum);
        }

        Order order = new Order();
        order.setUser(user);
        order.setOrderType(orderType);
        order.setStatus("PENDING");
        order.setDeliveryAddress("DELIVERY".equals(orderType) ? address : null);
        order.setPickupSlot("PICKUP".equals(orderType) ? slot : null);
        order.setPaymentMethod(payment);

        BigDecimal total = BigDecimal.ZERO;

        for (Map.Entry<Long, Integer> line : wanted.entrySet()) {

            Product product = productRepository.findByIdForUpdate(line.getKey())
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Product not found (it may have been removed): " + line.getKey()));

            int quantity = line.getValue();
            int stock = product.getStockQuantity() == null ? 0 : product.getStockQuantity();

            if (stock < quantity) {
                throw new IllegalArgumentException(
                        stock == 0
                                ? product.getName() + " is out of stock."
                                : "Only " + stock + " left in stock for " + product.getName() + ".");
            }

            // Price always comes from the database - never trust the browser.
            BigDecimal unitPrice = product.getPrice();
            BigDecimal subtotal = unitPrice.multiply(BigDecimal.valueOf(quantity));

            product.setStockQuantity(stock - quantity);
            productRepository.save(product);

            OrderItem item = new OrderItem();
            item.setProduct(product);
            item.setQuantity(quantity);
            item.setUnitPrice(unitPrice);
            item.setSubtotal(subtotal);
            order.addItem(item);

            total = total.add(subtotal);
        }

        order.setTotalAmount(total);

        return orderRepository.save(order);
    }

    // ==========================================
    // CUSTOMER - MY ORDERS / ONE ORDER / CANCEL
    // ==========================================

    @Transactional(readOnly = true)
    public List<Order> getUserOrders(User user) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
    }

    @Transactional(readOnly = true)
    public Order getOrderForUser(User user, Long orderId, boolean isStaffOrAdmin) {
        Order order = getOrderById(orderId);
        if (!isStaffOrAdmin && !order.getUser().getId().equals(user.getId())) {
            // 404 instead of 403 so other people's order ids are not revealed
            throw new ResourceNotFoundException("Order not found: " + orderId);
        }
        return order;
    }

    @Transactional
    public Order cancelMyOrder(User user, Long orderId) {
        Order order = getOrderById(orderId);

        if (!order.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Order not found: " + orderId);
        }
        if (!"PENDING".equals(order.getStatus())) {
            throw new IllegalArgumentException(
                    "Only pending orders can be cancelled. Please contact the store.");
        }
        return applyStatus(order, "CANCELLED");
    }

    // ==========================================
    // STAFF / ADMIN
    // ==========================================

    @Transactional(readOnly = true)
    public List<Order> getAllOrders() {
        return orderRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional(readOnly = true)
    public Order getOrderById(Long orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));
    }

    @Transactional
    public Order updateOrderStatus(Long orderId, String newStatus) {

        if (newStatus == null || newStatus.isBlank()) {
            throw new IllegalArgumentException("Status is required.");
        }

        String status = newStatus.trim().toUpperCase();
        if (!ALLOWED_STATUSES.contains(status)) {
            throw new IllegalArgumentException("Invalid order status: " + status);
        }

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));

        return applyStatus(order, status);
    }

    // ==========================================
    // internal: status change + stock handling
    // ==========================================

    private Order applyStatus(Order order, String status) {

        String current = order.getStatus();

        if (status.equals(current)) {
            return order;
        }
        if ("CANCELLED".equals(current)) {
            throw new IllegalArgumentException("A cancelled order cannot be changed.");
        }
        if ("CANCELLED".equals(status)) {
            if (FINISHED_STATUSES.contains(current)) {
                throw new IllegalArgumentException("A delivered order cannot be cancelled.");
            }
            restock(order);
        }

        order.setStatus(status);
        return orderRepository.save(order);
    }

    /** Puts the quantities of a cancelled order back into stock. */
    private void restock(Order order) {
        for (OrderItem item : order.getItems()) {
            Product product = productRepository.findByIdForUpdate(item.getProduct().getId())
                    .orElse(null);
            if (product == null) {
                continue;
            }
            int stock = product.getStockQuantity() == null ? 0 : product.getStockQuantity();
            product.setStockQuantity(stock + item.getQuantity());
            productRepository.save(product);
        }
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
