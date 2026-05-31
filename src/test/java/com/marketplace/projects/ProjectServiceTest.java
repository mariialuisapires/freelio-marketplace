package com.marketplace.projects;

import com.marketplace.projects.dto.ProjectRequest;
import com.marketplace.projects.entity.Project;
import com.marketplace.projects.entity.ProjectStatus;
import com.marketplace.projects.mapper.ProjectMapper;
import com.marketplace.projects.repository.ProjectRepository;
import com.marketplace.projects.service.ProjectService;
import com.marketplace.shared.exceptions.BusinessRuleException;
import com.marketplace.shared.exceptions.ResourceNotFoundException;
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
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProjectServiceTest {

    @Mock ProjectRepository projectRepository;
    @Mock ProjectMapper projectMapper;
    @Mock UserService userService;

    @InjectMocks ProjectService projectService;

    User client;
    Project project;

    @BeforeEach
    void setUp() {
        client = User.builder().id(UUID.randomUUID()).name("Cliente")
                .email("client@test.com").role(Role.CLIENT).build();
        project = Project.builder().id(UUID.randomUUID()).title("Projeto Teste")
                .description("Descrição do projeto de teste").budget(new BigDecimal("1000"))
                .deadline(LocalDate.now().plusDays(30)).status(ProjectStatus.OPEN).client(client).build();
    }

    @Test
    void findById_notFound_throwsException() {
        UUID id = UUID.randomUUID();
        when(projectRepository.findById(id)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> projectService.findById(id));
    }

    @Test
    void update_notOwner_throwsException() {
        when(projectRepository.findById(project.getId())).thenReturn(Optional.of(project));

        var request = new ProjectRequest("Novo Título", "Nova descrição longa o suficiente",
                new BigDecimal("2000"), LocalDate.now().plusDays(60));

        assertThrows(org.springframework.security.access.AccessDeniedException.class,
                () -> projectService.update(project.getId(), request, "other@test.com"));
    }

    @Test
    void update_inProgressProject_throwsException() {
        project.setStatus(ProjectStatus.IN_PROGRESS);
        when(projectRepository.findById(project.getId())).thenReturn(Optional.of(project));

        var request = new ProjectRequest("Novo Título", "Nova descrição longa o suficiente",
                new BigDecimal("2000"), LocalDate.now().plusDays(60));

        assertThrows(BusinessRuleException.class,
                () -> projectService.update(project.getId(), request, client.getEmail()));
    }

    @Test
    void delete_inProgressProject_throwsException() {
        project.setStatus(ProjectStatus.IN_PROGRESS);
        when(projectRepository.findById(project.getId())).thenReturn(Optional.of(project));

        assertThrows(BusinessRuleException.class,
                () -> projectService.delete(project.getId(), client.getEmail()));
    }
}
