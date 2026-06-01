package com.marketplace.contracts.service;

import com.marketplace.contracts.dto.ContractResponse;
import com.marketplace.contracts.dto.ContractUpdateRequest;
import com.marketplace.contracts.entity.Contract;
import com.marketplace.contracts.entity.ContractStatus;
import com.marketplace.contracts.mapper.ContractMapper;
import com.marketplace.contracts.repository.ContractRepository;
import com.marketplace.notifications.service.NotificationService;
import com.marketplace.projects.entity.ProjectStatus;
import com.marketplace.projects.service.ProjectService;
import com.marketplace.proposals.entity.Proposal;
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

import java.time.LocalDate;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ContractService {

    private final ContractRepository contractRepository;
    private final ContractMapper contractMapper;
    private final UserService userService;
    private final ProjectService projectService;
    private final NotificationService notificationService;

    @Transactional(readOnly = true)
    public Page<ContractResponse> findAll(String currentUserEmail, Pageable pageable) {
        User user = (User) userService.loadUserByUsername(currentUserEmail);
        return contractRepository.findByUserId(user.getId(), pageable).map(contractMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<ContractResponse> findCompletedByFreelancer(UUID freelancerId, Pageable pageable) {
        return contractRepository.findByFreelancerIdAndStatus(
                freelancerId, ContractStatus.FINISHED, pageable
        ).map(contractMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public ContractResponse findById(UUID id) {
        return contractMapper.toResponse(findContractById(id));
    }

    @Transactional
    public ContractResponse updateStatus(UUID id, ContractUpdateRequest request, String currentUserEmail) {
        Contract contract = findContractById(id);
        User currentUser = (User) userService.loadUserByUsername(currentUserEmail);

        ContractStatus newStatus = request.status();
        ContractStatus currentStatus = contract.getStatus();

        switch (newStatus) {
            case DELIVERED -> {
                if (!contract.getFreelancer().getId().equals(currentUser.getId())) {
                    throw new AccessDeniedException("Apenas o freelancer pode marcar como entregue");
                }
                if (currentStatus != ContractStatus.ACTIVE) {
                    throw new BusinessRuleException("Contrato precisa estar ACTIVE para ser entregue");
                }
                contract.setStatus(ContractStatus.DELIVERED);
                notificationService.create(
                        contract.getProject().getClient().getId(),
                        "Projeto entregue!",
                        "O freelancer %s entregou o projeto \"%s\"".formatted(
                                contract.getFreelancer().getName(), contract.getProject().getTitle())
                );
            }
            case FINISHED -> {
                if (!contract.getProject().getClient().getId().equals(currentUser.getId())) {
                    throw new AccessDeniedException("Apenas o cliente pode finalizar o contrato");
                }
                if (currentStatus != ContractStatus.DELIVERED) {
                    throw new BusinessRuleException("Contrato precisa estar DELIVERED para ser finalizado");
                }
                contract.setStatus(ContractStatus.FINISHED);
                contract.setEndDate(LocalDate.now());
                projectService.updateStatus(contract.getProject().getId(), ProjectStatus.COMPLETED);
                notificationService.create(
                        contract.getFreelancer().getId(),
                        "Contrato finalizado!",
                        "O contrato do projeto \"%s\" foi finalizado. Você já pode receber sua avaliação!".formatted(
                                contract.getProject().getTitle())
                );
            }
            case CANCELLED -> {
                boolean isClient = contract.getProject().getClient().getId().equals(currentUser.getId());
                boolean isFreelancer = contract.getFreelancer().getId().equals(currentUser.getId());
                if (!isClient && !isFreelancer) {
                    throw new AccessDeniedException("Sem permissão para cancelar este contrato");
                }
                if (currentStatus == ContractStatus.FINISHED) {
                    throw new BusinessRuleException("Contratos finalizados não podem ser cancelados");
                }
                contract.setStatus(ContractStatus.CANCELLED);
                projectService.updateStatus(contract.getProject().getId(), ProjectStatus.CANCELLED);
            }
            default -> throw new BusinessRuleException("Transição de status inválida");
        }

        return contractMapper.toResponse(contractRepository.save(contract));
    }

    @Transactional
    public void createFromProposal(Proposal proposal) {
        Contract contract = Contract.builder()
                .project(proposal.getProject())
                .freelancer(proposal.getFreelancer())
                .proposal(proposal)
                .agreedPrice(proposal.getPrice())
                .build();
        contractRepository.save(contract);
    }

    public Contract findContractById(UUID id) {
        return contractRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contrato", id));
    }
}
