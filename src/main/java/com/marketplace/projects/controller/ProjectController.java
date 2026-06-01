package com.marketplace.projects.controller;

import com.marketplace.projects.dto.ProjectRequest;
import com.marketplace.projects.dto.ProjectResponse;
import com.marketplace.projects.entity.ProjectStatus;
import com.marketplace.projects.service.ProjectService;
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

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/projects")
@RequiredArgsConstructor
@Tag(name = "Projetos")
@SecurityRequirement(name = "bearerAuth")
public class ProjectController {

    private final ProjectService projectService;

    @GetMapping
    @Operation(summary = "Listar projetos com filtros")
    public ResponseEntity<Page<ProjectResponse>> findAll(
            @RequestParam(required = false) ProjectStatus status,
            @RequestParam(required = false) BigDecimal minBudget,
            @RequestParam(required = false) BigDecimal maxBudget,
            @RequestParam(required = false) String keyword,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        return ResponseEntity.ok(projectService.findAll(status, minBudget, maxBudget, keyword, pageable));
    }

    @GetMapping("/by-categories")
    @Operation(summary = "Listar projetos por categorias do freelancer")
    public ResponseEntity<Page<ProjectResponse>> findByCategories(
            @RequestParam(required = false) List<UUID> categoryIds,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        return ResponseEntity.ok(projectService.findByCategories(categoryIds, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar projeto por ID")
    public ResponseEntity<ProjectResponse> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(projectService.findById(id));
    }

    @PostMapping
    @Operation(summary = "Criar projeto")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<ProjectResponse> create(
            @Valid @RequestBody ProjectRequest request,
            @AuthenticationPrincipal UserDetails currentUser
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(projectService.create(request, currentUser.getUsername()));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar projeto")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<ProjectResponse> update(
            @PathVariable UUID id,
            @Valid @RequestBody ProjectRequest request,
            @AuthenticationPrincipal UserDetails currentUser
    ) {
        return ResponseEntity.ok(projectService.update(id, request, currentUser.getUsername()));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Excluir projeto")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<Void> delete(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails currentUser
    ) {
        projectService.delete(id, currentUser.getUsername());
        return ResponseEntity.noContent().build();
    }
}
