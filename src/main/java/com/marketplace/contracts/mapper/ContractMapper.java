package com.marketplace.contracts.mapper;

import com.marketplace.contracts.dto.ContractResponse;
import com.marketplace.contracts.entity.Contract;
import com.marketplace.projects.mapper.ProjectMapper;
import com.marketplace.users.mapper.UserMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {ProjectMapper.class, UserMapper.class})
public interface ContractMapper {

    @Mapping(source = "proposal.id", target = "proposalId")
    ContractResponse toResponse(Contract contract);
}
