package com.marketplace.proposals.controller;

import com.marketplace.proposals.dto.ProposalRequest;
import com.marketplace.proposals.dto.ProposalResponse;
import com.marketplace.proposals.service.ProposalService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/proposals")
@RequiredArgsConstructor
@Tag(name = "Propostas")
@SecurityRequirement(name = "bearerAuth")
public class ProposalController {

    private final ProposalService proposalService;

    @GetMapping("/project/{projectId}")
    @Operation(summary = "Listar propostas de um projeto")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<Page<ProposalResponse>> findByProject(
            @PathVariable UUID projectId,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        return ResponseEntity.ok(proposalService.findByProject(projectId, pageable));
    }

    @GetMapping("/my")
    @Operation(summary = "Listar minhas propostas enviadas")
    @PreAuthorize("hasRole('FREELANCER')")
    public ResponseEntity<Page<ProposalResponse>> findMyProposals(
            @AuthenticationPrincipal UserDetails currentUser,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        UUID freelancerId = ((com.marketplace.users.entity.User) currentUser).getId();
        return ResponseEntity.ok(proposalService.findByFreelancer(freelancerId, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar proposta por ID")
    public ResponseEntity<ProposalResponse> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(proposalService.findById(id));
    }

    @PostMapping
    @Operation(summary = "Enviar proposta")
    @PreAuthorize("hasRole('FREELANCER')")
    public ResponseEntity<ProposalResponse> create(
            @Valid @RequestBody ProposalRequest request,
            @AuthenticationPrincipal UserDetails currentUser
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(proposalService.create(request, currentUser.getUsername()));
    }

    @PutMapping("/{id}/accept")
    @Operation(summary = "Aceitar proposta")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<ProposalResponse> accept(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails currentUser
    ) {
        return ResponseEntity.ok(proposalService.accept(id, currentUser.getUsername()));
    }

    @PutMapping("/{id}/reject")
    @Operation(summary = "Rejeitar proposta")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<ProposalResponse> reject(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails currentUser
    ) {
        return ResponseEntity.ok(proposalService.reject(id, currentUser.getUsername()));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Excluir proposta")
    @PreAuthorize("hasRole('FREELANCER')")
    public ResponseEntity<Void> delete(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails currentUser
    ) {
        proposalService.delete(id, currentUser.getUsername());
        return ResponseEntity.noContent().build();
    }
}
