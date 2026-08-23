package com.minidmart.backend.config;

import com.minidmart.backend.entity.Role;
import com.minidmart.backend.entity.User;
import com.minidmart.backend.repository.RoleRepository;
import com.minidmart.backend.repository.UserRepository;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initUsers(
            UserRepository userRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder
    ) {

        return args -> {

            // ==========================================
            // CREATE ROLES
            // ==========================================

            roleRepository
                    .findByName("CUSTOMER")
                    .orElseGet(() -> {
                        Role role = new Role();
                        role.setName("CUSTOMER");
                        return roleRepository.save(role);
                    });

            Role staffRole = roleRepository
                    .findByName("STAFF")
                    .orElseGet(() -> {
                        Role role = new Role();
                        role.setName("STAFF");
                        return roleRepository.save(role);
                    });

            Role adminRole = roleRepository
                    .findByName("ADMIN")
                    .orElseGet(() -> {
                        Role role = new Role();
                        role.setName("ADMIN");
                        return roleRepository.save(role);
                    });


            // ==========================================
            // ADMIN
            // ==========================================

            User admin = userRepository
                    .findByEmail("admin@gmail.com")
                    .orElseGet(User::new);

            admin.setName("Admin");
            admin.setEmail("admin@gmail.com");

            // Always store BCrypt password
            admin.setPassword(
                    passwordEncoder.encode("admin123")
            );

            admin.getRoles().clear();
            admin.getRoles().add(adminRole);

            userRepository.save(admin);


            // ==========================================
            // STAFF
            // ==========================================

            User staff = userRepository
                    .findByEmail("staff@gmail.com")
                    .orElseGet(User::new);

            staff.setName("Staff");
            staff.setEmail("staff@gmail.com");

            // BCrypt password
            staff.setPassword(
                    passwordEncoder.encode("staff123")
            );

            staff.getRoles().clear();
            staff.getRoles().add(staffRole);

            userRepository.save(staff);


            // ==========================================
            // PRINT LOGIN DETAILS
            // ==========================================

            System.out.println();
            System.out.println("====================================");
            System.out.println("USERS INITIALIZED");
            System.out.println("====================================");

            System.out.println(
                    "ADMIN  -> admin@gmail.com / admin123"
            );

            System.out.println(
                    "STAFF  -> staff@gmail.com / staff123"
            );

            System.out.println("====================================");
        };
    }
}