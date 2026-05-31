package com.marketplace.proposals.service;

import com.marketplace.contracts.service.ContractService;
import com.marketplace.notifications.service.NotificationService;
import com.marketplace.projects.entity.Project;
import com.marketplace.projects.entity.ProjectStatus;
import com.marketplace.projects.service.ProjectService;
import com.marketplace.proposals.dto.ProposalRequest;
import com.marketplace.proposals.dto.ProposalResponse;
import com.marketplace.proposals.entity.Proposal;
import com.marketplace.proposals.entity.ProposalStatus;
import com.marketplace.proposals.mapper.ProposalMapper;
import com.marketplace.proposals.repository.ProposalRepository;
import com.marketplace.shared.exceptions.BusinessRuleException;
import com.marketplace.shared.exceptions.ResourceNotFoundException;
import com.marketplace.users.entity.User;
import com.marketplace.users.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class ProposalService {

    private final ProposalRepository proposalRepository;
    private final ProposalMapper proposalMapper;
    private final UserService userService;
    private final ProjectService projectService;
    private final ContractService contractService;
    private final NotificationService notificationService;

    public ProposalService(ProposalRepository proposalRepository, ProposalMapper proposalMapper,
                           UserService userService, ProjectService projectService,
                           @Lazy ContractService contractService, NotificationService notificationService) {
        this.proposalRepository = proposalRepository;
        this.proposalMapper = proposalMapper;
        this.userService = userService;
        this.projectService = projectService;
        this.contractService = contractService;
        this.notificationService = notificationService;
    }

    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public Page<ProposalResponse> findByProject(UUID projectId, Pageable pageable) {
        return proposalRepository.findByProjectId(projectId, pageable).map(proposalMapper::toResponse);
    }

    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public Page<ProposalResponse> findByFreelancer(UUID freelancerId, Pageable pageable) {
        return proposalRepository.findByFreelancerId(freelancerId, pageable).map(proposalMapper::toResponse);
    }

    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public ProposalResponse findById(UUID id) {
        return proposalMapper.toResponse(findProposalById(id));
    }

    @Transactional
    public ProposalResponse create(ProposalRequest request, String freelancerEmail) {
        User freelancer = (User) userService.loadUserByUsername(freelancerEmail);
        Project project = projectService.findProjectById(request.projectId());

        if (project.getStatus() != ProjectStatus.OPEN) {
            throw new BusinessRuleException("Projeto não está disponível para propostas");
        }
        if (proposalRepository.existsByProjectIdAndFreelancerId(project.getId(), freelancer.getId())) {
            throw new BusinessRuleException("Você já enviou uma proposta para este projeto");
        }

        Proposal proposal = Proposal.builder()
                .message(request.message())
                .price(request.price())
                .deliveryDays(request.deliveryDays())
                .project(project)
                .freelancer(freelancer)
                .build();

        ProposalResponse response = proposalMapper.toResponse(proposalRepository.save(proposal));

        notificationService.create(
                project.getClient().getId(),
                "Nova proposta recebida",
                "O freelancer %s enviou uma proposta para o projeto \"%s\"".formatted(
                        freelancer.getName(), project.getTitle())
        );

        return response;
    }

    @Transactional
    public ProposalResponse accept(UUID id, String clientEmail) {
        Proposal proposal = findProposalById(id);
        validateClientOwnership(proposal, clientEmail);

        if (proposal.getStatus() != ProposalStatus.PENDING) {
            throw new BusinessRuleException("Proposta não está pendente");
        }
        if (proposal.getProject().getStatus() != ProjectStatus.OPEN) {
            throw new BusinessRuleException("Projeto não está disponível");
        }

        proposal.setStatus(ProposalStatus.ACCEPTED);
        proposalRepository.save(proposal);

        proposalRepository.rejectOtherProposals(
                proposal.getProject().getId(), proposal.getId(), ProposalStatus.REJECTED
        );

        projectService.updateStatus(proposal.getProject().getId(), ProjectStatus.IN_PROGRESS);
        contractService.createFromProposal(proposal);

        notificationService.create(
                proposal.getFreelancer().getId(),
                "Proposta aceita!",
                "Sua proposta para o projeto \"%s\" foi aceita".formatted(proposal.getProject().getTitle())
        );

        return proposalMapper.toResponse(proposal);
    }

    @Transactional
    public ProposalResponse reject(UUID id, String clientEmail) {
        Proposal proposal = findProposalById(id);
        validateClientOwnership(proposal, clientEmail);

        if (proposal.getStatus() != ProposalStatus.PENDING) {
            throw new BusinessRuleException("Proposta não está pendente");
        }

        proposal.setStatus(ProposalStatus.REJECTED);
        return proposalMapper.toResponse(proposalRepository.save(proposal));
    }

    @Transactional
    public void delete(UUID id, String freelancerEmail) {
        Proposal proposal = findProposalById(id);
        if (!proposal.getFreelancer().getEmail().equals(freelancerEmail)) {
            throw new AccessDeniedException("Você não pode excluir esta proposta");
        }
        if (proposal.getStatus() != ProposalStatus.PENDING) {
            throw new BusinessRuleException("Apenas propostas pendentes podem ser excluídas");
        }
        proposalRepository.delete(proposal);
    }

    public Proposal findProposalById(UUID id) {
        return proposalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Proposta", id));
    }

    private void validateClientOwnership(Proposal proposal, String email) {
        if (!proposal.getProject().getClient().getEmail().equals(email)) {
            throw new AccessDeniedException("Você não tem permissão para gerenciar esta proposta");
        }
    }
}
