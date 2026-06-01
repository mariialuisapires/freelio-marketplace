package com.marketplace.profile.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record CertificationRequest(
        @NotBlank String name,
        @NotBlank String issuer,
        @NotNull LocalDate issueDate,
        String credentialUrl
) {}
