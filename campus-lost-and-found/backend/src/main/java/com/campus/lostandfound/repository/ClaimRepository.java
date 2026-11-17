package com.campus.lostandfound.repository;

import com.campus.lostandfound.entity.Claim;
import com.campus.lostandfound.entity.ClaimStatus;
import com.campus.lostandfound.entity.Item;
import com.campus.lostandfound.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClaimRepository extends JpaRepository<Claim, Long> {

    Page<Claim> findByClaimantOrderByCreatedAtDesc(User claimant, Pageable pageable);

    Page<Claim> findAllByOrderByCreatedAtDesc(Pageable pageable);

    Page<Claim> findByStatusOrderByCreatedAtDesc(ClaimStatus status, Pageable pageable);

    List<Claim> findByItemAndStatus(Item item, ClaimStatus status);

    List<Claim> findByItem(Item item);

    boolean existsByItemAndClaimantAndStatus(Item item, User claimant, ClaimStatus status);

    long countByStatus(ClaimStatus status);

    long countByClaimant(User claimant);

    List<Claim> findTop5ByOrderByCreatedAtDesc();
}
