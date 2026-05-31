package com.marketplace.reviews;

import com.marketplace.contracts.entity.Contract;
import com.marketplace.contracts.entity.ContractStatus;
import com.marketplace.contracts.service.ContractService;
import com.marketplace.notifications.service.NotificationService;
import com.marketplace.projects.entity.Project;
import com.marketplace.reviews.dto.ReviewRequest;
import com.marketplace.reviews.mapper.ReviewMapper;
import com.marketplace.reviews.repository.ReviewRepository;
import com.marketplace.reviews.service.ReviewService;
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
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReviewServiceTest {

    @Mock ReviewRepository reviewRepository;
    @Mock ReviewMapper reviewMapper;
    @Mock ContractService contractService;
    @Mock UserService userService;
    @Mock NotificationService notificationService;

    @InjectMocks ReviewService reviewService;

    User client;
    User freelancer;
    Contract contract;

    @BeforeEach
    void setUp() {
        client = User.builder().id(UUID.randomUUID()).name("Cliente")
                .email("client@test.com").role(Role.CLIENT).build();
        freelancer = User.builder().id(UUID.randomUUID()).name("Freelancer")
                .email("free@test.com").role(Role.FREELANCER).build();
        Project project = Project.builder().id(UUID.randomUUID()).title("Projeto")
                .client(client).budget(new BigDecimal("1000"))
                .deadline(LocalDate.now().plusDays(30)).build();
        contract = Contract.builder().id(UUID.randomUUID()).project(project)
                .freelancer(freelancer).agreedPrice(new BigDecimal("900"))
                .status(ContractStatus.ACTIVE).startDate(LocalDate.now()).build();
    }

    @Test
    void create_contractNotFinished_throwsException() {
        var request = new ReviewRequest(contract.getId(), 5, "Ótimo trabalho!");
        when(contractService.findContractById(contract.getId())).thenReturn(contract);
        when(userService.loadUserByUsername(client.getEmail())).thenReturn(client);

        assertThrows(BusinessRuleException.class,
                () -> reviewService.create(request, client.getEmail()));
    }

    @Test
    void create_duplicateReview_throwsException() {
        contract.setStatus(ContractStatus.FINISHED);
        var request = new ReviewRequest(contract.getId(), 5, "Ótimo trabalho!");
        when(contractService.findContractById(contract.getId())).thenReturn(contract);
        when(userService.loadUserByUsername(client.getEmail())).thenReturn(client);
        when(reviewRepository.existsByContractId(contract.getId())).thenReturn(true);

        assertThrows(BusinessRuleException.class,
                () -> reviewService.create(request, client.getEmail()));
    }

    @Test
    void create_notClientOfProject_throwsException() {
        contract.setStatus(ContractStatus.FINISHED);
        User anotherClient = User.builder().id(UUID.randomUUID()).email("other@test.com")
                .role(Role.CLIENT).build();
        var request = new ReviewRequest(contract.getId(), 5, "Bom trabalho");
        when(contractService.findContractById(contract.getId())).thenReturn(contract);
        when(userService.loadUserByUsername(anotherClient.getEmail())).thenReturn(anotherClient);

        assertThrows(org.springframework.security.access.AccessDeniedException.class,
                () -> reviewService.create(request, anotherClient.getEmail()));
    }
}
