package com.marketplace.reviews.service;

import com.marketplace.contracts.entity.Contract;
import com.marketplace.contracts.entity.ContractStatus;
import com.marketplace.contracts.service.ContractService;
import com.marketplace.notifications.service.NotificationService;
import com.marketplace.reviews.dto.ReviewRequest;
import com.marketplace.reviews.dto.ReviewResponse;
import com.marketplace.reviews.entity.Review;
import com.marketplace.reviews.mapper.ReviewMapper;
import com.marketplace.reviews.repository.ReviewRepository;
import com.marketplace.shared.exceptions.BusinessRuleException;
import com.marketplace.shared.exceptions.ResourceNotFoundException;
import com.marketplace.users.entity.User;
import com.marketplace.users.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ReviewMapper reviewMapper;
    private final ContractService contractService;
    private final UserService userService;
    private final NotificationService notificationService;

    @Transactional(readOnly = true)
    public Page<ReviewResponse> findByFreelancer(UUID freelancerId, Pageable pageable) {
        return reviewRepository.findByFreelancerId(freelancerId, pageable).map(reviewMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public ReviewResponse findById(UUID id) {
        return reviewMapper.toResponse(reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Avaliação", id)));
    }

    public Double getAverageRating(UUID freelancerId) {
        return reviewRepository.findAverageRatingByFreelancerId(freelancerId).orElse(0.0);
    }

    @Transactional
    public ReviewResponse create(ReviewRequest request, String clientEmail) {
        Contract contract = contractService.findContractById(request.contractId());
        User client = (User) userService.loadUserByUsername(clientEmail);

        if (!contract.getProject().getClient().getId().equals(client.getId())) {
            throw new AccessDeniedException("Apenas o cliente do projeto pode avaliar");
        }
        if (contract.getStatus() != ContractStatus.FINISHED) {
            throw new BusinessRuleException("Avaliações só são permitidas em contratos finalizados");
        }
        if (reviewRepository.existsByContractId(contract.getId())) {
            throw new BusinessRuleException("Este contrato já possui avaliação");
        }

        Review review = Review.builder()
                .rating(request.rating())
                .comment(request.comment())
                .client(client)
                .freelancer(contract.getFreelancer())
                .contract(contract)
                .build();

        ReviewResponse response = reviewMapper.toResponse(reviewRepository.save(review));

        notificationService.create(
                contract.getFreelancer().getId(),
                "Nova avaliação recebida!",
                "Você recebeu uma avaliação %d/5 do projeto \"%s\"".formatted(
                        request.rating(), contract.getProject().getTitle())
        );

        return response;
    }
}
