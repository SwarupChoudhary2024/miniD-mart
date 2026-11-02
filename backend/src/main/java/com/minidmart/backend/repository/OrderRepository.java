package com.minidmart.backend.repository;

import com.minidmart.backend.entity.Order;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByUserId(Long userId);

    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Order> findByStatus(String status);

    List<Order> findAllByOrderByCreatedAtDesc();
}
