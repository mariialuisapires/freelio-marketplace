package com.marketplace.proposals.mapper;

import com.marketplace.projects.entity.Project;
import com.marketplace.proposals.dto.ProposalResponse;
import com.marketplace.proposals.entity.Proposal;
import com.marketplace.proposals.entity.ProposalStatus;
import com.marketplace.users.dto.UserResponse;
import com.marketplace.users.mapper.UserMapper;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;
import javax.annotation.processing.Generated;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-31T13:30:07-0300",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 22.0.2 (Oracle Corporation)"
)
@Component
public class ProposalMapperImpl implements ProposalMapper {

    @Autowired
    private UserMapper userMapper;

    @Override
    public ProposalResponse toResponse(Proposal proposal) {
        if ( proposal == null ) {
            return null;
        }

        UUID projectId = null;
        String projectTitle = null;
        UUID id = null;
        String message = null;
        BigDecimal price = null;
        Integer deliveryDays = null;
        ProposalStatus status = null;
        UserResponse freelancer = null;
        LocalDateTime createdAt = null;

        projectId = proposalProjectId( proposal );
        projectTitle = proposalProjectTitle( proposal );
        id = proposal.getId();
        message = proposal.getMessage();
        price = proposal.getPrice();
        deliveryDays = proposal.getDeliveryDays();
        status = proposal.getStatus();
        freelancer = userMapper.toResponse( proposal.getFreelancer() );
        createdAt = proposal.getCreatedAt();

        ProposalResponse proposalResponse = new ProposalResponse( id, message, price, deliveryDays, status, projectId, projectTitle, freelancer, createdAt );

        return proposalResponse;
    }

    private UUID proposalProjectId(Proposal proposal) {
        if ( proposal == null ) {
            return null;
        }
        Project project = proposal.getProject();
        if ( project == null ) {
            return null;
        }
        UUID id = project.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    private String proposalProjectTitle(Proposal proposal) {
        if ( proposal == null ) {
            return null;
        }
        Project project = proposal.getProject();
        if ( project == null ) {
            return null;
        }
        String title = project.getTitle();
        if ( title == null ) {
            return null;
        }
        return title;
    }
}
