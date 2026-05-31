package com.marketplace.reviews.controller;

import com.marketplace.reviews.dto.ReviewRequest;
import com.marketplace.reviews.dto.ReviewResponse;
import com.marketplace.reviews.service.ReviewService;
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
@RequestMapping("/reviews")
@RequiredArgsConstructor
@Tag(name = "Avaliações")
@SecurityRequirement(name = "bearerAuth")
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping("/freelancer/{freelancerId}")
    @Operation(summary = "Listar avaliações de um freelancer")
    public ResponseEntity<Page<ReviewResponse>> findByFreelancer(
            @PathVariable UUID freelancerId,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        return ResponseEntity.ok(reviewService.findByFreelancer(freelancerId, pageable));
    }

    @GetMapping("/freelancer/{freelancerId}/average")
    @Operation(summary = "Nota média de um freelancer")
    public ResponseEntity<Double> getAverageRating(@PathVariable UUID freelancerId) {
        return ResponseEntity.ok(reviewService.getAverageRating(freelancerId));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar avaliação por ID")
    public ResponseEntity<ReviewResponse> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(reviewService.findById(id));
    }

    @PostMapping
    @Operation(summary = "Criar avaliação")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<ReviewResponse> create(
            @Valid @RequestBody ReviewRequest request,
            @AuthenticationPrincipal UserDetails currentUser
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(reviewService.create(request, currentUser.getUsername()));
    }
}
