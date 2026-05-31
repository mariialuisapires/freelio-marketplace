package com.marketplace.proposals.repository;

import com.marketplace.proposals.entity.Proposal;
import com.marketplace.proposals.entity.ProposalStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ProposalRepository extends JpaRepository<Proposal, UUID> {

    Page<Proposal> findByProjectId(UUID projectId, Pageable pageable);

    Page<Proposal> findByFreelancerId(UUID freelancerId, Pageable pageable);

    boolean existsByProjectIdAndFreelancerId(UUID projectId, UUID freelancerId);

    @Modifying
    @Query("UPDATE Proposal p SET p.status = :status WHERE p.project.id = :projectId AND p.id <> :acceptedId")
    void rejectOtherProposals(@Param("projectId") UUID projectId,
                               @Param("acceptedId") UUID acceptedId,
                               @Param("status") ProposalStatus status);
}
