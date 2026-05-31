package com.marketplace.contracts;

import com.marketplace.contracts.dto.ContractUpdateRequest;
import com.marketplace.contracts.entity.Contract;
import com.marketplace.contracts.entity.ContractStatus;
import com.marketplace.contracts.mapper.ContractMapper;
import com.marketplace.contracts.repository.ContractRepository;
import com.marketplace.contracts.service.ContractService;
import com.marketplace.notifications.service.NotificationService;
import com.marketplace.projects.entity.Project;
import com.marketplace.projects.entity.ProjectStatus;
import com.marketplace.projects.service.ProjectService;
import com.marketplace.shared.exceptions.BusinessRuleException;
import com.marketplace.users.entity.Role;
import com.marketplace.users.entity.User;
import com.marketplace.users.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ContractServiceTest {

    @Mock ContractRepository contractRepository;
    @Mock ContractMapper contractMapper;
    @Mock UserService userService;
    @Mock ProjectService projectService;
    @Mock NotificationService notificationService;

    @InjectMocks ContractService contractService;

    User client;
    User freelancer;
    Project project;
    Contract contract;

    @BeforeEach
    void setUp() {
        client = User.builder().id(UUID.randomUUID()).name("Cliente")
                .email("client@test.com").role(Role.CLIENT).build();
        freelancer = User.builder().id(UUID.randomUUID()).name("Freelancer")
                .email("free@test.com").role(Role.FREELANCER).build();
        project = Project.builder().id(UUID.randomUUID()).title("Projeto").client(client)
                .status(ProjectStatus.IN_PROGRESS).budget(new BigDecimal("1000"))
                .deadline(LocalDate.now().plusDays(30)).build();
        contract = Contract.builder().id(UUID.randomUUID()).project(project)
                .freelancer(freelancer).agreedPrice(new BigDecimal("900"))
                .status(ContractStatus.ACTIVE).startDate(LocalDate.now()).build();
    }

    @Test
    void markDelivered_byFreelancer_success() {
        when(contractRepository.findById(contract.getId())).thenReturn(Optional.of(contract));
        when(userService.loadUserByUsername(freelancer.getEmail())).thenReturn(freelancer);
        when(contractRepository.save(any())).thenReturn(contract);
        when(contractMapper.toResponse(any())).thenReturn(null);

        contractService.updateStatus(contract.getId(),
                new ContractUpdateRequest(ContractStatus.DELIVERED), freelancer.getEmail());

        assertEquals(ContractStatus.DELIVERED, contract.getStatus());
    }

    @Test
    void markDelivered_byClient_throwsException() {
        when(contractRepository.findById(contract.getId())).thenReturn(Optional.of(contract));
        when(userService.loadUserByUsername(client.getEmail())).thenReturn(client);

        assertThrows(org.springframework.security.access.AccessDeniedException.class,
                () -> contractService.updateStatus(contract.getId(),
                        new ContractUpdateRequest(ContractStatus.DELIVERED), client.getEmail()));
    }

    @Test
    void finish_notDelivered_throwsException() {
        when(contractRepository.findById(contract.getId())).thenReturn(Optional.of(contract));
        when(userService.loadUserByUsername(client.getEmail())).thenReturn(client);

        assertThrows(BusinessRuleException.class,
                () -> contractService.updateStatus(contract.getId(),
                        new ContractUpdateRequest(ContractStatus.FINISHED), client.getEmail()));
    }
}
