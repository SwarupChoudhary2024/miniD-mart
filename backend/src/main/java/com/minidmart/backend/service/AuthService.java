package com.minidmart.backend.service;

import com.minidmart.backend.dto.AuthResponse;
import com.minidmart.backend.dto.LoginRequest;
import com.minidmart.backend.dto.RegisterRequest;
import com.minidmart.backend.entity.Role;
import com.minidmart.backend.entity.User;
import com.minidmart.backend.repository.RoleRepository;
import com.minidmart.backend.repository.UserRepository;
import com.minidmart.backend.security.JwtUtils;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AuthService {

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
    // REGISTER
    // =========================
    public AuthResponse register(RegisterRequest request) {

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already registered");
        }

        // Encode password before saving
        String encodedPassword =
                passwordEncoder.encode(request.getPassword());

        User user = new User(
                request.getEmail(),
                encodedPassword,
                request.getName()
        );

        // Default role = CUSTOMER
        Role customerRole = roleRepository
                .findByName("CUSTOMER")
                .orElseThrow(() ->
                        new RuntimeException(
                                "CUSTOMER role not found in database"
                        )
                );

        user.setRoles(Set.of(customerRole));

        userRepository.save(user);

        // Automatically login after registration
        LoginRequest loginRequest = new LoginRequest();

        loginRequest.setEmail(request.getEmail());
        loginRequest.setPassword(request.getPassword());

        return login(loginRequest);
    }

    // =========================
    // LOGIN
    // =========================
    public AuthResponse login(LoginRequest request) {

        Authentication authentication =
                authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(
                                request.getEmail(),
                                request.getPassword()
                        )
                );

        User user = (User) authentication.getPrincipal();

        String jwt = jwtUtils.generateToken(user);

        List<String> roles =
                user.getAuthorities()
                        .stream()
                        .map(GrantedAuthority::getAuthority)
                        .collect(Collectors.toList());

        return new AuthResponse(
                jwt,
                user.getId(),
                user.getEmail(),
                user.getName(),
                roles
        );
    }
}