package com.minidmart.backend.config;

import com.minidmart.backend.security.JwtAuthFilter;
import com.minidmart.backend.security.JwtUtils;
import com.minidmart.backend.service.CustomUserDetailsService;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.List;

@Configuration
public class SecurityConfig {

    private final CustomUserDetailsService userDetailsService;
    private final JwtUtils jwtUtils;
    private final List<String> allowedOriginPatterns;

    public SecurityConfig(
            CustomUserDetailsService userDetailsService,
            JwtUtils jwtUtils,
            @Value("${app.cors.allowed-origin-patterns:http://localhost:*,http://127.0.0.1:*}")
            String[] allowedOriginPatterns) {

        this.userDetailsService = userDetailsService;
        this.jwtUtils = jwtUtils;
        this.allowedOriginPatterns = Arrays.stream(allowedOriginPatterns)
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
    }

    // ------------------------------------------------------------------
    // PASSWORD ENCODER
    // ------------------------------------------------------------------
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // ------------------------------------------------------------------
    // AUTHENTICATION PROVIDER / MANAGER
    // ------------------------------------------------------------------
    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider =
                new DaoAuthenticationProvider(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    // ------------------------------------------------------------------
    // SECURITY FILTER CHAIN
    // ------------------------------------------------------------------
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        JwtAuthFilter jwtAuthFilter = new JwtAuthFilter(jwtUtils, userDetailsService);

        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // Missing / invalid / expired token -> 401 (so the frontend can send
                // the user back to the login page). Wrong role -> 403.
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((request, response, authException) ->
                                writeJson(response, 401, "Unauthorized",
                                        "Your session has expired or you are not logged in. Please log in again."))
                        .accessDeniedHandler((request, response, accessDeniedException) ->
                                writeJson(response, 403, "Forbidden",
                                        "You do not have permission to perform this action.")))

                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)

                .authorizeHttpRequests(auth -> auth

                        // CORS pre-flight
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // Spring's error dispatch (so real error bodies are returned)
                        .requestMatchers("/error").permitAll()

                        // LOGIN / REGISTER
                        .requestMatchers("/api/auth/**").permitAll()

                        // PRODUCTS: public read, staff/admin write
                        .requestMatchers(HttpMethod.GET, "/api/products/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/products/**").hasAnyRole("ADMIN", "STAFF")
                        .requestMatchers(HttpMethod.PUT, "/api/products/**").hasAnyRole("ADMIN", "STAFF")
                        .requestMatchers(HttpMethod.DELETE, "/api/products/**").hasAnyRole("ADMIN", "STAFF")

                        // ORDERS (place / my orders / cancel): any logged-in user
                        .requestMatchers("/api/orders/**").authenticated()

                        // ADMIN area
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")

                        // STAFF area (admins may use it too)
                        .requestMatchers("/api/staff/**").hasAnyRole("STAFF", "ADMIN")

                        .anyRequest().authenticated()
                );

        return http.build();
    }

    // ------------------------------------------------------------------
    // CORS  (single source of truth - no @CrossOrigin / WebMvcConfigurer needed)
    // ------------------------------------------------------------------
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(allowedOriginPatterns);
        configuration.setAllowedMethods(
                List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setExposedHeaders(List.of("Authorization"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    // ------------------------------------------------------------------
    // helper: JSON error body in the same shape as GlobalExceptionHandler
    // ------------------------------------------------------------------
    private static void writeJson(jakarta.servlet.http.HttpServletResponse response,
                                  int status, String error, String message)
            throws java.io.IOException {

        response.setStatus(status);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.getWriter().write(
                "{\"status\":" + status
                        + ",\"error\":\"" + error + "\""
                        + ",\"message\":\"" + message + "\"}");
    }
}
