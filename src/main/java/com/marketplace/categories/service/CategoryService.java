package com.marketplace.categories.service;

import com.marketplace.categories.dto.CategoryResponse;
import com.marketplace.categories.dto.FreelancerSpecialtyRequest;
import com.marketplace.categories.dto.SpecialtyResponse;
import com.marketplace.categories.entity.FreelancerSpecialty;
import com.marketplace.categories.entity.Specialty;
import com.marketplace.categories.repository.CategoryRepository;
import com.marketplace.categories.repository.FreelancerSpecialtyRepository;
import com.marketplace.categories.repository.SpecialtyRepository;
import com.marketplace.shared.exceptions.ResourceNotFoundException;
import com.marketplace.users.dto.UserResponse;
import com.marketplace.users.entity.User;
import com.marketplace.users.mapper.UserMapper;
import com.marketplace.users.repository.UserRepository;
import com.marketplace.users.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepo;
    private final SpecialtyRepository specialtyRepo;
    private final FreelancerSpecialtyRepository freelancerSpecialtyRepo;
    private final UserRepository userRepository;
    private final UserService userService;
    private final UserMapper userMapper;

    @Transactional(readOnly = true)
    public List<CategoryResponse> getAll() {
        return categoryRepo.findAll().stream().map(c -> new CategoryResponse(
                c.getId(), c.getName(), c.getSlug(), c.getIcon(), c.getDescription(),
                freelancerSpecialtyRepo.countFreelancersByCategory(c.getId()),
                specialtyRepo.findByCategoryId(c.getId()).stream()
                        .map(s -> new SpecialtyResponse(s.getId(), s.getName(), s.getSlug()))
                        .toList()
        )).toList();
    }

    @Transactional(readOnly = true)
    public CategoryResponse getById(UUID id) {
        var cat = categoryRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoria", id));
        return new CategoryResponse(
                cat.getId(), cat.getName(), cat.getSlug(), cat.getIcon(), cat.getDescription(),
                freelancerSpecialtyRepo.countFreelancersByCategory(cat.getId()),
                specialtyRepo.findByCategoryId(cat.getId()).stream()
                        .map(s -> new SpecialtyResponse(s.getId(), s.getName(), s.getSlug()))
                        .toList()
        );
    }

    @Transactional(readOnly = true)
    public List<SpecialtyResponse> getSpecialties(UUID categoryId) {
        return specialtyRepo.findByCategoryId(categoryId).stream()
                .map(s -> new SpecialtyResponse(s.getId(), s.getName(), s.getSlug()))
                .toList();
    }

    @Transactional(readOnly = true)
    public Page<UserResponse> getFreelancers(UUID categoryId, Pageable pageable) {
        return userRepository.findFreelancersByCategory(categoryId, pageable)
                .map(userMapper::toResponse);
    }

    @Transactional
    public void setFreelancerSpecialties(UUID freelancerId, FreelancerSpecialtyRequest request, String email) {
        User freelancer = userService.findUserById(freelancerId);
        if (!freelancer.getEmail().equals(email))
            throw new org.springframework.security.access.AccessDeniedException("Sem permissão");

        freelancerSpecialtyRepo.deleteByFreelancerId(freelancerId);

        if (request.specialtyIds() != null) {
            request.specialtyIds().forEach(specId -> {
                Specialty spec = specialtyRepo.findById(specId)
                        .orElseThrow(() -> new ResourceNotFoundException("Especialidade", specId));
                freelancerSpecialtyRepo.save(FreelancerSpecialty.builder()
                        .freelancer(freelancer)
                        .specialty(spec)
                        .isPrimary(specId.equals(request.primarySpecialtyId()))
                        .build());
            });
        }
    }

    @Transactional(readOnly = true)
    public List<SpecialtyResponse> getFreelancerSpecialties(UUID freelancerId) {
        return freelancerSpecialtyRepo.findByFreelancerId(freelancerId).stream()
                .map(fs -> new SpecialtyResponse(
                        fs.getSpecialty().getId(),
                        fs.getSpecialty().getName(),
                        fs.getSpecialty().getSlug()))
                .toList();
    }
}
