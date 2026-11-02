package com.minidmart.backend.exception;

/** Thrown when a request conflicts with existing data (HTTP 409). */
public class ConflictException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    public ConflictException(String message) {
        super(message);
    }
}
