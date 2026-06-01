package com.marketplace.projects.mapper;

import com.marketplace.categories.entity.Category;
import com.marketplace.projects.dto.ProjectRequest;
import com.marketplace.projects.dto.ProjectResponse;
import com.marketplace.projects.entity.Project;
import com.marketplace.projects.entity.ProjectStatus;
import com.marketplace.users.dto.UserResponse;
import com.marketplace.users.mapper.UserMapper;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;
import javax.annotation.processing.Generated;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-31T21:20:24-0300",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 22.0.2 (Oracle Corporation)"
)
@Component
public class ProjectMapperImpl implements ProjectMapper {

    @Autowired
    private UserMapper userMapper;

    @Override
    public ProjectResponse toResponse(Project project) {
        if ( project == null ) {
            return null;
        }

        UUID categoryId = null;
        String categoryName = null;
        String categoryIcon = null;
        UUID id = null;
        String title = null;
        String description = null;
        BigDecimal budget = null;
        LocalDate deadline = null;
        ProjectStatus status = null;
        LocalDateTime createdAt = null;
        UserResponse client = null;

        categoryId = projectCategoryId( project );
        categoryName = projectCategoryName( project );
        categoryIcon = projectCategoryIcon( project );
        id = project.getId();
        title = project.getTitle();
        description = project.getDescription();
        budget = project.getBudget();
        deadline = project.getDeadline();
        status = project.getStatus();
        createdAt = project.getCreatedAt();
        client = userMapper.toResponse( project.getClient() );

        ProjectResponse projectResponse = new ProjectResponse( id, title, description, budget, deadline, status, createdAt, client, categoryId, categoryName, categoryIcon );

        return projectResponse;
    }

    @Override
    public Project toEntity(ProjectRequest request) {
        if ( request == null ) {
            return null;
        }

        Project.ProjectBuilder project = Project.builder();

        project.title( request.title() );
        project.description( request.description() );
        project.budget( request.budget() );
        project.deadline( request.deadline() );

        return project.build();
    }

    private UUID projectCategoryId(Project project) {
        if ( project == null ) {
            return null;
        }
        Category category = project.getCategory();
        if ( category == null ) {
            return null;
        }
        UUID id = category.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    private String projectCategoryName(Project project) {
        if ( project == null ) {
            return null;
        }
        Category category = project.getCategory();
        if ( category == null ) {
            return null;
        }
        String name = category.getName();
        if ( name == null ) {
            return null;
        }
        return name;
    }

    private String projectCategoryIcon(Project project) {
        if ( project == null ) {
            return null;
        }
        Category category = project.getCategory();
        if ( category == null ) {
            return null;
        }
        String icon = category.getIcon();
        if ( icon == null ) {
            return null;
        }
        return icon;
    }
}
