package com.marketplace.proposals.mapper;

import com.marketplace.proposals.dto.ProposalResponse;
import com.marketplace.proposals.entity.Proposal;
import com.marketplace.users.mapper.UserMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = UserMapper.class)
public interface ProposalMapper {

    @Mapping(source = "project.id", target = "projectId")
    @Mapping(source = "project.title", target = "projectTitle")
    ProposalResponse toResponse(Proposal proposal);
}
