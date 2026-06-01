package com.marketplace.contracts.controller;

import com.marketplace.contracts.dto.ContractResponse;
import com.marketplace.contracts.dto.ContractUpdateRequest;
import com.marketplace.contracts.service.ContractService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/contracts")
@RequiredArgsConstructor
@Tag(name = "Contratos")
@SecurityRequirement(name = "bearerAuth")
public class ContractController {

    private final ContractService contractService;

    @GetMapping
    @Operation(summary = "Listar meus contratos")
    public ResponseEntity<Page<ContractResponse>> findAll(
            @AuthenticationPrincipal UserDetails currentUser,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        return ResponseEntity.ok(contractService.findAll(currentUser.getUsername(), pageable));
    }

    @GetMapping("/freelancer/{freelancerId}/completed")
    @Operation(summary = "Listar projetos concluídos de um freelancer (público)")
    public ResponseEntity<Page<ContractResponse>> findCompletedByFreelancer(
            @PathVariable UUID freelancerId,
            @PageableDefault(size = 12) Pageable pageable
    ) {
        return ResponseEntity.ok(contractService.findCompletedByFreelancer(freelancerId, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar contrato por ID")
    public ResponseEntity<ContractResponse> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(contractService.findById(id));
    }

    @PutMapping("/{id}/status")
    @Operation(summary = "Atualizar status do contrato")
    public ResponseEntity<ContractResponse> updateStatus(
            @PathVariable UUID id,
            @Valid @RequestBody ContractUpdateRequest request,
            @AuthenticationPrincipal UserDetails currentUser
    ) {
        return ResponseEntity.ok(contractService.updateStatus(id, request, currentUser.getUsername()));
    }
}
