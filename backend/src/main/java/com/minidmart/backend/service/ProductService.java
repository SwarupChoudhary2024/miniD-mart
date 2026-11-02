package com.minidmart.backend.service;

import com.minidmart.backend.entity.Product;
import com.minidmart.backend.exception.ConflictException;
import com.minidmart.backend.exception.ResourceNotFoundException;
import com.minidmart.backend.repository.ProductRepository;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    // ------------------------------------------------------------------
    // READ
    // ------------------------------------------------------------------

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public List<Product> getByCategory(String category) {
        return productRepository.findByCategory(category);
    }

    public List<Product> searchProducts(String keyword) {
        return productRepository.findByNameContainingIgnoreCase(keyword);
    }

    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
    }

    // ------------------------------------------------------------------
    // CREATE
    // ------------------------------------------------------------------

    @Transactional
    public Product createProduct(Product product) {
        if (product == null) {
            throw new IllegalArgumentException("Product details are required.");
        }
        product.setId(null);           // never overwrite an existing row by accident
        prepareAndValidate(product);
        return productRepository.save(product);
    }

    @Transactional
    public List<Product> createProducts(List<Product> products) {
        if (products == null || products.isEmpty()) {
            throw new IllegalArgumentException("At least one product is required.");
        }
        for (Product product : products) {
            product.setId(null);
            prepareAndValidate(product);
        }
        return productRepository.saveAll(products);
    }

    // ------------------------------------------------------------------
    // UPDATE
    // ------------------------------------------------------------------

    @Transactional
    public Product updateProduct(Long id, Product details) {
        if (details == null) {
            throw new IllegalArgumentException("Product details are required.");
        }

        Product product = getProductById(id);

        prepareAndValidate(details);

        product.setName(details.getName());
        product.setCategory(details.getCategory());
        product.setProductType(details.getProductType());
        product.setImage(details.getImage());
        product.setPrice(details.getPrice());
        product.setMrp(details.getMrp());
        product.setQuantity(details.getQuantity());
        product.setStockQuantity(details.getStockQuantity());

        // The admin form does not send these two - do not wipe them.
        if (details.getDescription() != null) {
            product.setDescription(details.getDescription());
        }
        if (details.getUnit() != null) {
            product.setUnit(details.getUnit());
        }

        return productRepository.save(product);
    }

    // ------------------------------------------------------------------
    // DELETE
    // ------------------------------------------------------------------

    public void deleteProduct(Long id) {
        Product product = getProductById(id);
        try {
            productRepository.delete(product);
            productRepository.flush();
        } catch (DataIntegrityViolationException ex) {
            throw new ConflictException(
                    "This product is part of existing orders and cannot be deleted. "
                            + "Set its stock to 0 instead.");
        }
    }

    // ------------------------------------------------------------------
    // VALIDATION
    // ------------------------------------------------------------------

    private void prepareAndValidate(Product product) {

        if (product.getName() == null || product.getName().isBlank()) {
            throw new IllegalArgumentException("Product name is required.");
        }
        product.setName(product.getName().trim());

        if (product.getPrice() == null || product.getPrice().compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("A valid price (0 or more) is required.");
        }
        if (product.getMrp() != null && product.getMrp().compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("MRP cannot be negative.");
        }
        if (product.getStockQuantity() == null) {
            product.setStockQuantity(0);
        }
        if (product.getStockQuantity() < 0) {
            throw new IllegalArgumentException("Stock quantity cannot be negative.");
        }
        if (product.getCategory() != null) {
            product.setCategory(product.getCategory().trim());
        }
    }
}
