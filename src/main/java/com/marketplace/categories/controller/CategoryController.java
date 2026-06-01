package com.marketplace.categories.controller;

import com.marketplace.categories.dto.CategoryResponse;
import com.marketplace.categories.dto.FreelancerSpecialtyRequest;
import com.marketplace.categories.dto.SpecialtyResponse;
import com.marketplace.categories.service.CategoryService;
import com.marketplace.users.dto.UserResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/categories")
@RequiredArgsConstructor
@Tag(name = "Categorias")
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    @Operation(summary = "Listar todas as categorias")
    public ResponseEntity<List<CategoryResponse>> getAll() {
        return ResponseEntity.ok(categoryService.getAll());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar categoria por ID")
    public ResponseEntity<CategoryResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(categoryService.getById(id));
    }

    @GetMapping("/{id}/specialties")
    @Operation(summary = "Listar especialidades da categoria")
    public ResponseEntity<List<SpecialtyResponse>> getSpecialties(@PathVariable UUID id) {
        return ResponseEntity.ok(categoryService.getSpecialties(id));
    }

    @GetMapping("/{id}/freelancers")
    @Operation(summary = "Listar freelancers da categoria")
    public ResponseEntity<Page<UserResponse>> getFreelancers(
            @PathVariable UUID id,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        return ResponseEntity.ok(categoryService.getFreelancers(id, pageable));
    }

    @PutMapping("/freelancers/{freelancerId}/specialties")
    @Operation(summary = "Definir especialidades do freelancer")
    @PreAuthorize("hasRole('FREELANCER')")
    public ResponseEntity<Void> setSpecialties(
            @PathVariable UUID freelancerId,
            @Valid @RequestBody FreelancerSpecialtyRequest request,
            @AuthenticationPrincipal UserDetails currentUser
    ) {
        categoryService.setFreelancerSpecialties(freelancerId, request, currentUser.getUsername());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/freelancers/{freelancerId}/specialties")
    @Operation(summary = "Buscar especialidades do freelancer")
    public ResponseEntity<List<SpecialtyResponse>> getFreelancerSpecialties(@PathVariable UUID freelancerId) {
        return ResponseEntity.ok(categoryService.getFreelancerSpecialties(freelancerId));
    }
}
