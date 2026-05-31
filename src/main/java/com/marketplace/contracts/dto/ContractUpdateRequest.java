package com.marketplace.contracts.dto;

import com.marketplace.contracts.entity.ContractStatus;
import jakarta.validation.constraints.NotNull;

public record ContractUpdateRequest(
        @NotNull(message = "Status é obrigatório")
        ContractStatus status
) {}
