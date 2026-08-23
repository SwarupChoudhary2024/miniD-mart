package com.minidmart.backend.controller;

import com.minidmart.backend.entity.Product;
import com.minidmart.backend.repository.ProductRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "http://localhost:5173")
public class ProductController {

    private final ProductRepository productRepository;

    public ProductController(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    // =====================================
    // GET ALL PRODUCTS
    // =====================================

    @GetMapping
    public List<Product> getAllProducts() {

        return productRepository.findAll();

    }

    // =====================================
    // GET PRODUCT BY ID
    // =====================================

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(
            @PathVariable Long id
    ) {

        return productRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());

    }

    // =====================================
    // GET PRODUCTS BY CATEGORY
    // Example:
    // /api/products/category/Grocery
    // =====================================

    @GetMapping("/category/{category}")
    public List<Product> getProductsByCategory(
            @PathVariable String category
    ) {

        return productRepository.findByCategory(category);

    }

    // =====================================
    // ADD PRODUCT
    // =====================================

    @PostMapping
    public ResponseEntity<Product> addProduct(
            @RequestBody Product product
    ) {

        Product savedProduct =
                productRepository.save(product);

        return ResponseEntity.ok(savedProduct);

    }

    // =====================================
    // ADD MULTIPLE PRODUCTS
    // =====================================

    @PostMapping("/bulk")
    public ResponseEntity<List<Product>> addMultipleProducts(
            @RequestBody List<Product> products
    ) {

        List<Product> savedProducts =
                productRepository.saveAll(products);

        return ResponseEntity.ok(savedProducts);

    }

    // =====================================
    // UPDATE PRODUCT
    // =====================================

    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(

            @PathVariable Long id,

            @RequestBody Product productDetails
    ) {

        return productRepository.findById(id)
                .map(product -> {

                    product.setName(
                            productDetails.getName()
                    );

                    product.setDescription(
                            productDetails.getDescription()
                    );

                    product.setPrice(
                            productDetails.getPrice()
                    );

                    product.setMrp(
                            productDetails.getMrp()
                    );

                    product.setStockQuantity(
                            productDetails.getStockQuantity()
                    );

                    product.setUnit(
                            productDetails.getUnit()
                    );

                    product.setCategory(
                            productDetails.getCategory()
                    );

                    product.setProductType(
                            productDetails.getProductType()
                    );

                    product.setQuantity(
                            productDetails.getQuantity()
                    );

                    product.setImage(
                            productDetails.getImage()
                    );

                    Product updatedProduct =
                            productRepository.save(product);

                    return ResponseEntity.ok(updatedProduct);

                })
                .orElse(
                        ResponseEntity.notFound().build()
                );
    }

    // =====================================
    // DELETE PRODUCT
    // =====================================

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(
            @PathVariable Long id
    ) {

        if (!productRepository.existsById(id)) {

            return ResponseEntity.notFound().build();

        }

        productRepository.deleteById(id);

        return ResponseEntity.noContent().build();
    }
}