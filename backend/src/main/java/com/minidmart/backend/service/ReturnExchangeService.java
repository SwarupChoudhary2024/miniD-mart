package com.minidmart.backend.service;

import com.minidmart.backend.entity.Order;
import com.minidmart.backend.entity.Product;
import com.minidmart.backend.entity.ReturnExchangeRequest;
import com.minidmart.backend.exception.ResourceNotFoundException;
import com.minidmart.backend.repository.OrderRepository;
import com.minidmart.backend.repository.ProductRepository;
import com.minidmart.backend.repository.ReturnExchangeRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ReturnExchangeService {

    private final ReturnExchangeRepository requestRepository;
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    public ReturnExchangeService(ReturnExchangeRepository requestRepository,
                                 OrderRepository orderRepository,
                                 ProductRepository productRepository) {
        this.requestRepository = requestRepository;
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
    }

    @Transactional
    public ReturnExchangeRequest createRequest(Long orderId, Long productId, String type, String reason) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        ReturnExchangeRequest req = new ReturnExchangeRequest();
        req.setOrder(order);
        req.setProduct(product);
        req.setRequestType(type);
        req.setReason(reason);
        req.setStatus("PENDING");

        return requestRepository.save(req);
    }

    @Transactional
    public ReturnExchangeRequest processRequest(Long requestId, String status) {
        ReturnExchangeRequest req = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Request not found"));

        req.setStatus(status);

        // Restock product if a return request gets approved
        if ("APPROVED".equalsIgnoreCase(status) && "RETURN".equalsIgnoreCase(req.getRequestType())) {
            Product product = req.getProduct();
            int stock = product.getStockQuantity() == null ? 0 : product.getStockQuantity();
            product.setStockQuantity(stock + 1);
            productRepository.save(product);
        }

        return requestRepository.save(req);
    }

    @Transactional(readOnly = true)
    public List<ReturnExchangeRequest> getRequestsByStatus(String status) {
        return requestRepository.findByStatus(status);
    }
}
