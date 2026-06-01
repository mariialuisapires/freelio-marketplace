package com.marketplace.projects.service;

import com.marketplace.categories.entity.Category;
import com.marketplace.categories.repository.CategoryRepository;
import com.marketplace.projects.dto.ProjectRequest;
import com.marketplace.projects.dto.ProjectResponse;
import com.marketplace.projects.entity.Project;
import com.marketplace.projects.entity.ProjectStatus;
import com.marketplace.projects.mapper.ProjectMapper;
import com.marketplace.projects.repository.ProjectRepository;
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

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectMapper projectMapper;
    private final UserService userService;
    private final CategoryRepository categoryRepository;

    @Transactional(readOnly = true)
    public Page<ProjectResponse> findAll(ProjectStatus status, BigDecimal minBudget, BigDecimal maxBudget,
                                         String keyword, Pageable pageable) {
        return projectRepository.findWithFilters(status, minBudget, maxBudget, keyword, pageable)
                .map(projectMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<ProjectResponse> findByCategories(List<UUID> categoryIds, Pageable pageable) {
        if (categoryIds == null || categoryIds.isEmpty()) {
            return projectRepository.findWithFilters(ProjectStatus.OPEN, null, null, null, pageable)
                    .map(projectMapper::toResponse);
        }
        return projectRepository.findByCategoryIds(categoryIds, pageable)
                .map(projectMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public ProjectResponse findById(UUID id) {
        return projectMapper.toResponse(findProjectById(id));
    }

    @Transactional
    public ProjectResponse create(ProjectRequest request, String clientEmail) {
        User client = (User) userService.loadUserByUsername(clientEmail);
        Project project = projectMapper.toEntity(request);
        project.setClient(client);
        if (request.categoryId() != null) {
            categoryRepository.findById(request.categoryId()).ifPresent(project::setCategory);
        }
        return projectMapper.toResponse(projectRepository.save(project));
    }

    @Transactional
    public ProjectResponse update(UUID id, ProjectRequest request, String currentUserEmail) {
        Project project = findProjectById(id);
        validateOwnership(project, currentUserEmail);
        if (project.getStatus() != ProjectStatus.OPEN) {
            throw new BusinessRuleException("Apenas projetos OPEN podem ser editados");
        }
        project.setTitle(request.title());
        project.setDescription(request.description());
        project.setBudget(request.budget());
        project.setDeadline(request.deadline());
        if (request.categoryId() != null) {
            categoryRepository.findById(request.categoryId()).ifPresent(project::setCategory);
        }
        return projectMapper.toResponse(projectRepository.save(project));
    }

    @Transactional
    public void delete(UUID id, String currentUserEmail) {
        Project project = findProjectById(id);
        validateOwnership(project, currentUserEmail);
        if (project.getStatus() == ProjectStatus.IN_PROGRESS) {
            throw new BusinessRuleException("Não é possível excluir um projeto em andamento");
        }
        projectRepository.delete(project);
    }

    public Project findProjectById(UUID id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Projeto", id));
    }

    @Transactional
    public void updateStatus(UUID id, ProjectStatus status) {
        Project project = findProjectById(id);
        project.setStatus(status);
        projectRepository.save(project);
    }

    private void validateOwnership(Project project, String email) {
        if (!project.getClient().getEmail().equals(email)) {
            throw new AccessDeniedException("Você não tem permissão para modificar este projeto");
        }
    }
}
