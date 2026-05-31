package com.marketplace.proposals;

import com.marketplace.contracts.service.ContractService;
import com.marketplace.notifications.service.NotificationService;
import com.marketplace.projects.entity.Project;
import com.marketplace.projects.entity.ProjectStatus;
import com.marketplace.projects.service.ProjectService;
import com.marketplace.proposals.dto.ProposalRequest;
import com.marketplace.proposals.entity.Proposal;
import com.marketplace.proposals.entity.ProposalStatus;
import com.marketplace.proposals.mapper.ProposalMapper;
import com.marketplace.proposals.repository.ProposalRepository;
import com.marketplace.proposals.service.ProposalService;
import com.marketplace.shared.exceptions.BusinessRuleException;
import com.marketplace.users.entity.Role;
import com.marketplace.users.entity.User;
import com.marketplace.users.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProposalServiceTest {

    @Mock ProposalRepository proposalRepository;
    @Mock ProposalMapper proposalMapper;
    @Mock UserService userService;
    @Mock ProjectService projectService;
    @Mock ContractService contractService;
    @Mock NotificationService notificationService;

    ProposalService proposalService;

    User client;
    User freelancer;
    Project project;

    @BeforeEach
    void setUp() {
        proposalService = new ProposalService(proposalRepository, proposalMapper, userService,
                projectService, contractService, notificationService);

        client = User.builder().id(UUID.randomUUID()).name("Cliente")
                .email("client@test.com").role(Role.CLIENT).build();
        freelancer = User.builder().id(UUID.randomUUID()).name("Freelancer")
                .email("free@test.com").role(Role.FREELANCER).build();
        project = Project.builder().id(UUID.randomUUID()).title("Projeto")
                .description("Descrição").budget(new BigDecimal("1000"))
                .deadline(LocalDate.now().plusDays(30)).status(ProjectStatus.OPEN).client(client).build();
    }

    @Test
    void create_duplicateProposal_throwsException() {
        when(userService.loadUserByUsername(freelancer.getEmail())).thenReturn(freelancer);
        when(projectService.findProjectById(project.getId())).thenReturn(project);
        when(proposalRepository.existsByProjectIdAndFreelancerId(project.getId(), freelancer.getId()))
                .thenReturn(true);

        var request = new ProposalRequest(project.getId(), "Minha proposta detalhada aqui",
                new BigDecimal("900"), 15);

        assertThrows(BusinessRuleException.class,
                () -> proposalService.create(request, freelancer.getEmail()));
    }

    @Test
    void create_closedProject_throwsException() {
        project.setStatus(ProjectStatus.IN_PROGRESS);
        when(userService.loadUserByUsername(freelancer.getEmail())).thenReturn(freelancer);
        when(projectService.findProjectById(project.getId())).thenReturn(project);

        var request = new ProposalRequest(project.getId(), "Minha proposta detalhada aqui",
                new BigDecimal("900"), 15);

        assertThrows(BusinessRuleException.class,
                () -> proposalService.create(request, freelancer.getEmail()));
    }

    @Test
    void accept_nonPendingProposal_throwsException() {
        Proposal proposal = Proposal.builder().id(UUID.randomUUID()).project(project)
                .freelancer(freelancer).status(ProposalStatus.ACCEPTED)
                .price(new BigDecimal("900")).deliveryDays(15).build();
        when(proposalRepository.findById(proposal.getId())).thenReturn(java.util.Optional.of(proposal));

        assertThrows(BusinessRuleException.class,
                () -> proposalService.accept(proposal.getId(), client.getEmail()));
    }
}
