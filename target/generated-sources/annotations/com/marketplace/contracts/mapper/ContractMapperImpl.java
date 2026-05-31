package com.marketplace.contracts.mapper;

import com.marketplace.contracts.dto.ContractResponse;
import com.marketplace.contracts.entity.Contract;
import com.marketplace.contracts.entity.ContractStatus;
import com.marketplace.projects.dto.ProjectResponse;
import com.marketplace.projects.mapper.ProjectMapper;
import com.marketplace.proposals.entity.Proposal;
import com.marketplace.users.dto.UserResponse;
import com.marketplace.users.mapper.UserMapper;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;
import javax.annotation.processing.Generated;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-31T13:30:08-0300",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 22.0.2 (Oracle Corporation)"
)
@Component
public class ContractMapperImpl implements ContractMapper {

    @Autowired
    private ProjectMapper projectMapper;
    @Autowired
    private UserMapper userMapper;

    @Override
    public ContractResponse toResponse(Contract contract) {
        if ( contract == null ) {
            return null;
        }

        UUID proposalId = null;
        UUID id = null;
        ProjectResponse project = null;
        UserResponse freelancer = null;
        BigDecimal agreedPrice = null;
        LocalDate startDate = null;
        LocalDate endDate = null;
        ContractStatus status = null;

        proposalId = contractProposalId( contract );
        id = contract.getId();
        project = projectMapper.toResponse( contract.getProject() );
        freelancer = userMapper.toResponse( contract.getFreelancer() );
        agreedPrice = contract.getAgreedPrice();
        startDate = contract.getStartDate();
        endDate = contract.getEndDate();
        status = contract.getStatus();

        ContractResponse contractResponse = new ContractResponse( id, project, freelancer, proposalId, agreedPrice, startDate, endDate, status );

        return contractResponse;
    }

    private UUID contractProposalId(Contract contract) {
        if ( contract == null ) {
            return null;
        }
        Proposal proposal = contract.getProposal();
        if ( proposal == null ) {
            return null;
        }
        UUID id = proposal.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }
}
