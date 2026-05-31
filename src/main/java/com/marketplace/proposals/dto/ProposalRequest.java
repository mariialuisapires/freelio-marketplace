package com.marketplace.proposals.dto;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.util.UUID;

public record ProposalRequest(
        @NotNull(message = "ID do projeto é obrigatório")
        UUID projectId,

        @NotBlank(message = "Mensagem é obrigatória")
        @Size(min = 20, message = "Mensagem deve ter no mínimo 20 caracteres")
        String message,

        @NotNull(message = "Preço é obrigatório")
        @Positive(message = "Preço deve ser positivo")
        BigDecimal price,

        @NotNull(message = "Prazo de entrega é obrigatório")
        @Positive(message = "Prazo deve ser positivo")
        Integer deliveryDays
) {}
