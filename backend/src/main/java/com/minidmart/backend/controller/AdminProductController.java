package com.minidmart.backend.controller;

import com.minidmart.backend.entity.Product;
import com.minidmart.backend.repository.ProductRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/products")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminProductController {

    private final ProductRepository productRepository;

    public AdminProductController(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    // GET ALL PRODUCTS
    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts() {

        return ResponseEntity.ok(
                productRepository.findAll()
        );
    }

    // ADD PRODUCT
    @PostMapping
    public ResponseEntity<Product> addProduct(
            @RequestBody Product product) {

        try {

            if (product.getStockQuantity() == null) {
                product.setStockQuantity(0);
            }

            Product savedProduct =
                    productRepository.save(product);

            return ResponseEntity.ok(savedProduct);

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .internalServerError()
                    .build();
        }
    }

    // UPDATE PRODUCT
    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(
            @PathVariable Long id,
            @RequestBody Product productDetails) {

        return productRepository.findById(id)
                .map(product -> {

                    product.setName(productDetails.getName());
                    product.setCategory(productDetails.getCategory());
                    product.setProductType(productDetails.getProductType());
                    product.setImage(productDetails.getImage());
                    product.setPrice(productDetails.getPrice());
                    product.setMrp(productDetails.getMrp());
                    product.setQuantity(productDetails.getQuantity());
                    product.setStockQuantity(
                            productDetails.getStockQuantity()
                    );

                    return ResponseEntity.ok(
                            productRepository.save(product)
                    );

                })
                .orElse(ResponseEntity.notFound().build());
    }

    // DELETE PRODUCT
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(
            @PathVariable Long id) {

        if (!productRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        productRepository.deleteById(id);

        return ResponseEntity.noContent().build();
    }
}