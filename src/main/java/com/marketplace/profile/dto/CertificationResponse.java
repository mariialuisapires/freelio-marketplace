package com.marketplace.profile.dto;

import java.time.LocalDate;
import java.util.UUID;

public record CertificationResponse(
        UUID id,
        String name,
        String issuer,
        LocalDate issueDate,
        String credentialUrl
) {}
