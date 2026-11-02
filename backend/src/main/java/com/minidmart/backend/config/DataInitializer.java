package com.minidmart.backend.config;

import com.minidmart.backend.entity.Product;
import com.minidmart.backend.entity.Role;
import com.minidmart.backend.entity.User;
import com.minidmart.backend.repository.ProductRepository;
import com.minidmart.backend.repository.RoleRepository;
import com.minidmart.backend.repository.UserRepository;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Runs once at start-up: creates the roles, a default admin + staff login
 * and (optionally) a few demo products. Existing data is never overwritten.
 */
@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initData(
            UserRepository userRepository,
            RoleRepository roleRepository,
            ProductRepository productRepository,
            PasswordEncoder passwordEncoder,
            @Value("${app.seed-sample-products:true}") boolean seedSampleProducts) {

        return args -> {

            // ---------------- ROLES ----------------
            ensureRole(roleRepository, "CUSTOMER");
            Role staffRole = ensureRole(roleRepository, "STAFF");
            Role adminRole = ensureRole(roleRepository, "ADMIN");

            // ---------------- DEFAULT LOGINS ----------------
            ensureUser(userRepository, passwordEncoder,
                    "admin@gmail.com", "Admin", "admin123", adminRole);
            ensureUser(userRepository, passwordEncoder,
                    "staff@gmail.com", "Staff", "staff123", staffRole);

            // ---------------- DEMO PRODUCTS ----------------
            if (seedSampleProducts && productRepository.count() == 0) {
                productRepository.saveAll(List.of(
                        product("Basmati Rice", "Grocery", "Rice", "89", "110", "1 kg", 40),
                        product("Toor Dal", "Grocery", "Pulses", "145", "170", "1 kg", 30),
                        product("Sunflower Oil", "Grocery", "Oil", "135", "155", "1 L", 25),
                        product("Full Cream Milk", "Dairy", "Milk", "34", "34", "500 ml", 60),
                        product("Amul Butter", "Dairy", "Butter", "56", "60", "100 g", 35),
                        product("Cola Drink", "Beverages", "Soft Drink", "40", "45", "750 ml", 50),
                        product("Orange Juice", "Beverages", "Juice", "99", "120", "1 L", 20),
                        product("Potato Chips", "Snacks", "Chips", "20", "20", "52 g", 80),
                        product("Chocolate Cookies", "Snacks", "Biscuits", "30", "35", "120 g", 45),
                        product("Bath Soap", "Personal Care", "Soap", "38", "42", "125 g", 70),
                        product("Dish Wash Gel", "Home Care", "Cleaner", "99", "115", "500 ml", 30),
                        product("Camphor Tablets", "Pooja Needs", "Pooja", "45", "50", "25 pcs", 40)
                ));
            }

            System.out.println();
            System.out.println("====================================");
            System.out.println(" MINI D-MART READY");
            System.out.println(" ADMIN -> admin@gmail.com / admin123");
            System.out.println(" STAFF -> staff@gmail.com / staff123");
            System.out.println("====================================");
        };
    }

    private Role ensureRole(RoleRepository roleRepository, String name) {
        return roleRepository.findByName(name)
                .orElseGet(() -> roleRepository.save(new Role(name)));
    }

    private void ensureUser(UserRepository userRepository,
                            PasswordEncoder passwordEncoder,
                            String email, String name, String rawPassword, Role role) {

        User user = userRepository.findByEmail(email).orElseGet(User::new);
        boolean changed = false;

        if (user.getId() == null) {
            user.setEmail(email);
            user.setName(name);
            user.setPassword(passwordEncoder.encode(rawPassword));
            changed = true;
        } else if (user.getPassword() == null || !user.getPassword().startsWith("$2")) {
            // An older version stored a plain-text password - repair it once.
            user.setPassword(passwordEncoder.encode(rawPassword));
            changed = true;
        }

        boolean hasRole = user.getRoles().stream()
                .anyMatch(r -> r.getName().equalsIgnoreCase(role.getName()));
        if (!hasRole) {
            Set<Role> roles = new HashSet<>();
            roles.add(role);
            user.setRoles(roles);
            changed = true;
        }

        if (changed) {
            userRepository.save(user);
        }
    }

    private Product product(String name, String category, String type,
                            String price, String mrp, String pack, int stock) {
        Product p = new Product();
        p.setName(name);
        p.setCategory(category);
        p.setProductType(type);
        p.setPrice(new BigDecimal(price));
        p.setMrp(new BigDecimal(mrp));
        p.setQuantity(pack);
        p.setUnit(pack);
        p.setStockQuantity(stock);
        p.setDescription(name + " - fresh stock at Mini D-Mart");
        return p;
    }
}
