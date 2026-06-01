package com.marketplace.profile.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marketplace.profile.dto.*;
import com.marketplace.profile.entity.*;
import com.marketplace.profile.repository.*;
import com.marketplace.shared.exceptions.BusinessRuleException;
import com.marketplace.shared.exceptions.ResourceNotFoundException;
import com.marketplace.users.entity.User;
import com.marketplace.users.repository.UserRepository;
import com.marketplace.users.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProfileService {

    private final UserService userService;
    private final UserRepository userRepository;
    private final PortfolioProjectRepository portfolioRepo;
    private final ExperienceRepository experienceRepo;
    private final CertificationRepository certificationRepo;
    private final FavoriteFreelancerRepository favoriteRepo;
    private final ObjectMapper objectMapper;

    // === PROFILE UPDATE ===

    @Transactional
    public void updateProfile(UUID userId, ProfileUpdateRequest request, String currentEmail) {
        User user = userService.findUserById(userId);
        if (!user.getEmail().equals(currentEmail)) throw new AccessDeniedException("Sem permissão");

        if (request.name() != null) user.setName(request.name());
        if (request.bio() != null) user.setBio(request.bio());
        if (request.title() != null) user.setTitle(request.title());
        if (request.location() != null) user.setLocation(request.location());
        if (request.website() != null) user.setWebsite(request.website());
        if (request.linkedin() != null) user.setLinkedin(request.linkedin());
        if (request.availability() != null) user.setAvailability(request.availability());
        if (request.skills() != null) user.setSkills(serializeSkills(request.skills()));

        userRepository.save(user);
    }

    public List<String> getSkills(UUID userId) {
        User user = userService.findUserById(userId);
        return deserializeSkills(user.getSkills());
    }

    // === PORTFOLIO ===

    @Transactional(readOnly = true)
    public List<PortfolioProjectResponse> getPortfolio(UUID userId) {
        return portfolioRepo.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(p -> new PortfolioProjectResponse(p.getId(), p.getTitle(), p.getDescription(),
                        p.getImageUrl(), p.getGithubUrl(), p.getDemoUrl(),
                        deserializeSkills(p.getTechnologies()), p.getCreatedAt()))
                .toList();
    }

    @Transactional
    public PortfolioProjectResponse addPortfolio(UUID userId, PortfolioProjectRequest request, String currentEmail) {
        User user = userService.findUserById(userId);
        if (!user.getEmail().equals(currentEmail)) throw new AccessDeniedException("Sem permissão");

        PortfolioProject project = PortfolioProject.builder()
                .title(request.title())
                .description(request.description())
                .imageUrl(request.imageUrl())
                .githubUrl(request.githubUrl())
                .demoUrl(request.demoUrl())
                .technologies(serializeSkills(request.technologies()))
                .user(user)
                .build();

        project = portfolioRepo.save(project);
        return new PortfolioProjectResponse(project.getId(), project.getTitle(), project.getDescription(),
                project.getImageUrl(), project.getGithubUrl(), project.getDemoUrl(),
                request.technologies(), project.getCreatedAt());
    }

    @Transactional
    public void deletePortfolio(UUID projectId, String currentEmail) {
        PortfolioProject p = portfolioRepo.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Projeto de portfólio", projectId));
        if (!p.getUser().getEmail().equals(currentEmail)) throw new AccessDeniedException("Sem permissão");
        portfolioRepo.delete(p);
    }

    // === EXPERIENCE ===

    @Transactional(readOnly = true)
    public List<ExperienceResponse> getExperiences(UUID userId) {
        return experienceRepo.findByUserIdOrderByStartDateDesc(userId).stream()
                .map(e -> new ExperienceResponse(e.getId(), e.getCompany(), e.getPosition(),
                        e.getStartDate(), e.getEndDate(), e.getDescription()))
                .toList();
    }

    @Transactional
    public ExperienceResponse addExperience(UUID userId, ExperienceRequest request, String currentEmail) {
        User user = userService.findUserById(userId);
        if (!user.getEmail().equals(currentEmail)) throw new AccessDeniedException("Sem permissão");

        Experience exp = Experience.builder()
                .company(request.company())
                .position(request.position())
                .startDate(request.startDate())
                .endDate(request.endDate())
                .description(request.description())
                .user(user)
                .build();
        exp = experienceRepo.save(exp);
        return new ExperienceResponse(exp.getId(), exp.getCompany(), exp.getPosition(),
                exp.getStartDate(), exp.getEndDate(), exp.getDescription());
    }

    @Transactional
    public void deleteExperience(UUID expId, String currentEmail) {
        Experience exp = experienceRepo.findById(expId)
                .orElseThrow(() -> new ResourceNotFoundException("Experiência", expId));
        if (!exp.getUser().getEmail().equals(currentEmail)) throw new AccessDeniedException("Sem permissão");
        experienceRepo.delete(exp);
    }

    // === CERTIFICATIONS ===

    @Transactional(readOnly = true)
    public List<CertificationResponse> getCertifications(UUID userId) {
        return certificationRepo.findByUserIdOrderByIssueDateDesc(userId).stream()
                .map(c -> new CertificationResponse(c.getId(), c.getName(), c.getIssuer(),
                        c.getIssueDate(), c.getCredentialUrl()))
                .toList();
    }

    @Transactional
    public CertificationResponse addCertification(UUID userId, CertificationRequest request, String currentEmail) {
        User user = userService.findUserById(userId);
        if (!user.getEmail().equals(currentEmail)) throw new AccessDeniedException("Sem permissão");

        Certification cert = Certification.builder()
                .name(request.name())
                .issuer(request.issuer())
                .issueDate(request.issueDate())
                .credentialUrl(request.credentialUrl())
                .user(user)
                .build();
        cert = certificationRepo.save(cert);
        return new CertificationResponse(cert.getId(), cert.getName(), cert.getIssuer(),
                cert.getIssueDate(), cert.getCredentialUrl());
    }

    @Transactional
    public void deleteCertification(UUID certId, String currentEmail) {
        Certification cert = certificationRepo.findById(certId)
                .orElseThrow(() -> new ResourceNotFoundException("Certificação", certId));
        if (!cert.getUser().getEmail().equals(currentEmail)) throw new AccessDeniedException("Sem permissão");
        certificationRepo.delete(cert);
    }

    // === FAVORITES ===

    @Transactional
    public void favorite(UUID freelancerId, String clientEmail) {
        User client = (User) userService.loadUserByUsername(clientEmail);
        if (favoriteRepo.existsByClientIdAndFreelancerId(client.getId(), freelancerId)) {
            throw new BusinessRuleException("Freelancer já está nos favoritos");
        }
        User freelancer = userService.findUserById(freelancerId);
        favoriteRepo.save(FavoriteFreelancer.builder().client(client).freelancer(freelancer).build());
    }

    @Transactional
    public void unfavorite(UUID freelancerId, String clientEmail) {
        User client = (User) userService.loadUserByUsername(clientEmail);
        favoriteRepo.findByClientIdAndFreelancerId(client.getId(), freelancerId)
                .ifPresent(favoriteRepo::delete);
    }

    public boolean isFavorited(UUID freelancerId, String clientEmail) {
        User client = (User) userService.loadUserByUsername(clientEmail);
        return favoriteRepo.existsByClientIdAndFreelancerId(client.getId(), freelancerId);
    }

    public List<UUID> getFavoriteIds(String clientEmail) {
        User client = (User) userService.loadUserByUsername(clientEmail);
        return favoriteRepo.findByClientId(client.getId()).stream()
                .map(f -> f.getFreelancer().getId())
                .toList();
    }

    // === HELPERS ===

    private String serializeSkills(List<String> skills) {
        if (skills == null || skills.isEmpty()) return null;
        try {
            return objectMapper.writeValueAsString(skills);
        } catch (Exception e) {
            return String.join(",", skills);
        }
    }

    public List<String> deserializeSkills(String skills) {
        if (skills == null || skills.isBlank()) return List.of();
        try {
            return objectMapper.readValue(skills, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            return List.of(skills.split(","));
        }
    }
}
