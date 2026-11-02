package com.minidmart.backend.service;

import com.minidmart.backend.dto.AuthResponse;
import com.minidmart.backend.dto.LoginRequest;
import com.minidmart.backend.dto.RegisterRequest;
import com.minidmart.backend.entity.Role;
import com.minidmart.backend.entity.User;
import com.minidmart.backend.exception.ConflictException;
import com.minidmart.backend.repository.RoleRepository;
import com.minidmart.backend.repository.UserRepository;
import com.minidmart.backend.security.JwtUtils;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.regex.Pattern;

@Service
public class AuthService {

    private static final Pattern EMAIL_PATTERN =
            Pattern.compile("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$");

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;

    public AuthService(
            UserRepository userRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtUtils jwtUtils) {

        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtUtils = jwtUtils;
    }

    // =========================
    // REGISTER  (always creates a CUSTOMER)
    // =========================
    public AuthResponse register(RegisterRequest request) {

        if (request == null) {
            throw new IllegalArgumentException("Registration details are required.");
        }

        String name = request.getName() == null ? "" : request.getName().trim();
        String email = normalizeEmail(request.getEmail());
        String password = request.getPassword() == null ? "" : request.getPassword();
        String phone = request.getPhone() == null ? null : request.getPhone().trim();

        if (name.isEmpty()) {
            throw new IllegalArgumentException("Name is required.");
        }
        if (!EMAIL_PATTERN.matcher(email).matches()) {
            throw new IllegalArgumentException("Please enter a valid email address.");
        }
        if (password.length() < 6) {
            throw new IllegalArgumentException("Password must be at least 6 characters long.");
        }
        if (phone != null && phone.length() > 20) {
            throw new IllegalArgumentException("Phone number is too long.");
        }
        if (userRepository.findByEmail(email).isPresent()) {
            throw new ConflictException("Email already registered.");
        }

        Role customerRole = roleRepository.findByName("CUSTOMER")
                .orElseGet(() -> roleRepository.save(new Role("CUSTOMER")));

        User user = new User(email, passwordEncoder.encode(password), name);
        user.setPhone(phone == null || phone.isEmpty() ? null : phone);

        Set<Role> roles = new HashSet<>();
        roles.add(customerRole);
        user.setRoles(roles);

        userRepository.save(user);

        // Automatically log the new customer in
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail(email);
        loginRequest.setPassword(password);
        return login(loginRequest);
    }

    // =========================
    // LOGIN
    // =========================
    public AuthResponse login(LoginRequest request) {

        if (request == null
                || request.getEmail() == null || request.getEmail().isBlank()
                || request.getPassword() == null || request.getPassword().isEmpty()) {
            throw new IllegalArgumentException("Email and password are required.");
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        normalizeEmail(request.getEmail()),
                        request.getPassword()));

        User user = (User) authentication.getPrincipal();

        String jwt = jwtUtils.generateToken(user);

        List<String> roles = user.getAuthorities()
                .stream()
                .map(GrantedAuthority::getAuthority)
                .toList();

        return new AuthResponse(jwt, user.getId(), user.getEmail(), user.getName(), roles);
    }

    private String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase();
    }
}
