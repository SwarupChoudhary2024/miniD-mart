package com.minidmart.backend.repository;

import com.minidmart.backend.entity.ReturnExchangeRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReturnExchangeRepository extends JpaRepository<ReturnExchangeRequest, Long> {
    List<ReturnExchangeRequest> findByOrderStatus(String status);
    List<ReturnExchangeRequest> findByStatus(String status);
}