package com.marketplace.profile.controller;

import com.marketplace.profile.dto.*;
import com.marketplace.profile.service.ProfileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/profile")
@RequiredArgsConstructor
@Tag(name = "Perfil Freelancer")
@SecurityRequirement(name = "bearerAuth")
public class ProfileController {

    private final ProfileService profileService;

    @PutMapping("/{userId}")
    @Operation(summary = "Atualizar perfil completo")
    public ResponseEntity<Void> updateProfile(
            @PathVariable UUID userId,
            @Valid @RequestBody ProfileUpdateRequest request,
            @AuthenticationPrincipal UserDetails currentUser
    ) {
        profileService.updateProfile(userId, request, currentUser.getUsername());
        return ResponseEntity.noContent().build();
    }

    // === PORTFOLIO ===

    @GetMapping("/{userId}/portfolio")
    @Operation(summary = "Listar portfólio")
    public ResponseEntity<List<PortfolioProjectResponse>> getPortfolio(@PathVariable UUID userId) {
        return ResponseEntity.ok(profileService.getPortfolio(userId));
    }

    @PostMapping("/{userId}/portfolio")
    @Operation(summary = "Adicionar projeto ao portfólio")
    public ResponseEntity<PortfolioProjectResponse> addPortfolio(
            @PathVariable UUID userId,
            @Valid @RequestBody PortfolioProjectRequest request,
            @AuthenticationPrincipal UserDetails currentUser
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(profileService.addPortfolio(userId, request, currentUser.getUsername()));
    }

    @DeleteMapping("/{userId}/portfolio/{projectId}")
    @Operation(summary = "Remover projeto do portfólio")
    public ResponseEntity<Void> deletePortfolio(
            @PathVariable UUID userId,
            @PathVariable UUID projectId,
            @AuthenticationPrincipal UserDetails currentUser
    ) {
        profileService.deletePortfolio(projectId, currentUser.getUsername());
        return ResponseEntity.noContent().build();
    }

    // === EXPERIENCE ===

    @GetMapping("/{userId}/experience")
    @Operation(summary = "Listar experiências")
    public ResponseEntity<List<ExperienceResponse>> getExperiences(@PathVariable UUID userId) {
        return ResponseEntity.ok(profileService.getExperiences(userId));
    }

    @PostMapping("/{userId}/experience")
    @Operation(summary = "Adicionar experiência")
    public ResponseEntity<ExperienceResponse> addExperience(
            @PathVariable UUID userId,
            @Valid @RequestBody ExperienceRequest request,
            @AuthenticationPrincipal UserDetails currentUser
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(profileService.addExperience(userId, request, currentUser.getUsername()));
    }

    @DeleteMapping("/{userId}/experience/{expId}")
    @Operation(summary = "Remover experiência")
    public ResponseEntity<Void> deleteExperience(
            @PathVariable UUID userId,
            @PathVariable UUID expId,
            @AuthenticationPrincipal UserDetails currentUser
    ) {
        profileService.deleteExperience(expId, currentUser.getUsername());
        return ResponseEntity.noContent().build();
    }

    // === CERTIFICATIONS ===

    @GetMapping("/{userId}/certifications")
    @Operation(summary = "Listar certificações")
    public ResponseEntity<List<CertificationResponse>> getCertifications(@PathVariable UUID userId) {
        return ResponseEntity.ok(profileService.getCertifications(userId));
    }

    @PostMapping("/{userId}/certifications")
    @Operation(summary = "Adicionar certificação")
    public ResponseEntity<CertificationResponse> addCertification(
            @PathVariable UUID userId,
            @Valid @RequestBody CertificationRequest request,
            @AuthenticationPrincipal UserDetails currentUser
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(profileService.addCertification(userId, request, currentUser.getUsername()));
    }

    @DeleteMapping("/{userId}/certifications/{certId}")
    @Operation(summary = "Remover certificação")
    public ResponseEntity<Void> deleteCertification(
            @PathVariable UUID userId,
            @PathVariable UUID certId,
            @AuthenticationPrincipal UserDetails currentUser
    ) {
        profileService.deleteCertification(certId, currentUser.getUsername());
        return ResponseEntity.noContent().build();
    }

    // === FAVORITES ===

    @PostMapping("/{freelancerId}/favorite")
    @Operation(summary = "Favoritar freelancer")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<Void> favorite(
            @PathVariable UUID freelancerId,
            @AuthenticationPrincipal UserDetails currentUser
    ) {
        profileService.favorite(freelancerId, currentUser.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @DeleteMapping("/{freelancerId}/favorite")
    @Operation(summary = "Desfavoritar freelancer")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<Void> unfavorite(
            @PathVariable UUID freelancerId,
            @AuthenticationPrincipal UserDetails currentUser
    ) {
        profileService.unfavorite(freelancerId, currentUser.getUsername());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{freelancerId}/favorite")
    @Operation(summary = "Verificar se freelancer é favorito")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<Map<String, Boolean>> isFavorited(
            @PathVariable UUID freelancerId,
            @AuthenticationPrincipal UserDetails currentUser
    ) {
        return ResponseEntity.ok(Map.of("favorited", profileService.isFavorited(freelancerId, currentUser.getUsername())));
    }
}
