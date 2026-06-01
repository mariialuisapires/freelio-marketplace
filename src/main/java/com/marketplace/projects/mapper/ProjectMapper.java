package com.marketplace.projects.mapper;

import com.marketplace.projects.dto.ProjectRequest;
import com.marketplace.projects.dto.ProjectResponse;
import com.marketplace.projects.entity.Project;
import com.marketplace.users.mapper.UserMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = UserMapper.class)
public interface ProjectMapper {

    @Mapping(source = "category.id", target = "categoryId")
    @Mapping(source = "category.name", target = "categoryName")
    @Mapping(source = "category.icon", target = "categoryIcon")
    ProjectResponse toResponse(Project project);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "client", ignore = true)
    @Mapping(target = "category", ignore = true)
    Project toEntity(ProjectRequest request);
}
