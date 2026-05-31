package com.marketplace.contracts.repository;

import com.marketplace.contracts.entity.Contract;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ContractRepository extends JpaRepository<Contract, UUID> {

    @Query("SELECT c FROM Contract c WHERE c.project.client.id = :userId OR c.freelancer.id = :userId")
    Page<Contract> findByUserId(@Param("userId") UUID userId, Pageable pageable);

    Page<Contract> findByFreelancerId(UUID freelancerId, Pageable pageable);
}
