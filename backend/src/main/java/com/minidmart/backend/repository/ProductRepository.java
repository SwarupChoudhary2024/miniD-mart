package com.minidmart.backend.repository;

import com.minidmart.backend.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {

    // Search products by name
    List<Product> findByNameContainingIgnoreCase(String keyword);

    // Find products by category
    List<Product> findByCategory(String category);
}