package com.marketplace.projects.dto;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record ProjectRequest(
        @NotBlank(message = "Título é obrigatório")
        @Size(min = 5, max = 255)
        String title,

        @NotBlank(message = "Descrição é obrigatória")
        @Size(min = 20)
        String description,

        @NotNull(message = "Orçamento é obrigatório")
        @Positive(message = "Orçamento deve ser positivo")
        BigDecimal budget,

        @NotNull(message = "Prazo é obrigatório")
        @Future(message = "Prazo deve ser uma data futura")
        LocalDate deadline,

        UUID categoryId
) {}
