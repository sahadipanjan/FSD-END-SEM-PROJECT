package com.campus.lostandfound.service;

import com.campus.lostandfound.dto.claim.ClaimCreateRequest;
import com.campus.lostandfound.dto.claim.ClaimResponse;
import com.campus.lostandfound.entity.*;
import com.campus.lostandfound.exception.BadRequestException;
import com.campus.lostandfound.exception.ResourceNotFoundException;
import com.campus.lostandfound.repository.ClaimRepository;
import com.campus.lostandfound.repository.ItemRepository;
import com.campus.lostandfound.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
public class ClaimService {

    private final ClaimRepository claimRepository;
    private final ItemRepository itemRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;

    public ClaimService(ClaimRepository claimRepository,
                        ItemRepository itemRepository,
                        UserRepository userRepository,
                        NotificationService notificationService,
                        AuditLogService auditLogService) {
        this.claimRepository = claimRepository;
        this.itemRepository = itemRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.auditLogService = auditLogService;
    }

    @Transactional
    public ClaimResponse submitClaim(Long itemId, ClaimCreateRequest request, Long userId) {
        User claimant = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found with id: " + itemId));

        // Business Rule: A user cannot claim their own item
        if (item.getReportedBy().getId().equals(userId)) {
            throw new BadRequestException("You cannot submit a claim on an item that you reported");
        }

        // Business Rule: Cannot claim a non-OPEN item
        if (item.getStatus() != ItemStatus.OPEN) {
            throw new BadRequestException("Claims can only be filed on OPEN items. This item is " + item.getStatus());
        }

        // Business Rule: Cannot submit duplicate pending claims on the same item
        if (claimRepository.existsByItemAndClaimantAndStatus(item, claimant, ClaimStatus.PENDING)) {
            throw new BadRequestException("You already have a pending claim submitted for this item");
        }

        Claim claim = new Claim();
        claim.setItem(item);
        claim.setClaimant(claimant);
        claim.setMessage(request.getMessage().trim());
        claim.setStatus(ClaimStatus.PENDING);

        claim = claimRepository.save(claim);

        // Notify item reporter
        notificationService.createNotification(
                item.getReportedBy(),
                "New Claim Submitted",
                "A campus member (" + claimant.getFullName() + ") submitted a claim for your item: \"" + item.getTitle() + "\". The campus desk will mediate."
        );

        return mapToClaimResponse(claim);
    }

    public Page<ClaimResponse> getMyClaims(Long userId, Pageable pageable) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return claimRepository.findByClaimantOrderByCreatedAtDesc(user, pageable)
                .map(this::mapToClaimResponse);
    }

    public Page<ClaimResponse> getClaimsQueue(ClaimStatus status, Pageable pageable) {
        if (status != null) {
            return claimRepository.findByStatusOrderByCreatedAtDesc(status, pageable)
                    .map(this::mapToClaimResponse);
        }
        return claimRepository.findAllByOrderByCreatedAtDesc(pageable)
                .map(this::mapToClaimResponse);
    }

    @Transactional
    public ClaimResponse approveClaim(Long claimId, String remark, Admin admin) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found with id: " + claimId));

        if (claim.getStatus() != ClaimStatus.PENDING) {
            throw new BadRequestException("Only PENDING claims can be approved. This claim is already " + claim.getStatus());
        }

        Item item = claim.getItem();

        claim.setStatus(ClaimStatus.APPROVED);
        claim.setAdmin(admin);
        claim.setAdminRemark(StringUtils.hasText(remark) ? remark.trim() : "Approved by desk administration.");
        claim = claimRepository.save(claim);

        // Item status becomes RESOLVED
        item.setStatus(ItemStatus.RESOLVED);
        itemRepository.save(item);

        // Automatically reject all other pending claims on this item
        List<Claim> otherPendingClaims = claimRepository.findByItemAndStatus(item, ClaimStatus.PENDING);
        for (Claim other : otherPendingClaims) {
            if (!other.getId().equals(claim.getId())) {
                other.setStatus(ClaimStatus.REJECTED);
                other.setAdmin(admin);
                other.setAdminRemark("Item ownership verified and released to another claimant.");
                claimRepository.save(other);

                notificationService.createNotification(
                        other.getClaimant(),
                        "Claim Decision Notice",
                        "Your claim for item \"" + item.getTitle() + "\" was closed because another claim was verified and approved by the campus desk."
                );
            }
        }

        // Notification to approved claimant
        notificationService.createNotification(
                claim.getClaimant(),
                "Claim Approved!",
                "Great news! Your claim for \"" + item.getTitle() + "\" has been APPROVED. Please visit the Campus Lost & Found desk to collect your item. Desk remark: " + claim.getAdminRemark()
        );

        // Notification to item reporter
        notificationService.createNotification(
                item.getReportedBy(),
                "Item Resolved!",
                "Your reported item \"" + item.getTitle() + "\" has been resolved through an approved claim."
        );

        // Audit log
        auditLogService.recordLog(
                admin,
                "CLAIM_APPROVED",
                "CLAIM",
                claim.getId(),
                "Approved claim #" + claim.getId() + " for item #" + item.getId() + " (" + item.getTitle() + ") to user " + claim.getClaimant().getEmail()
        );

        auditLogService.recordLog(
                admin,
                "ITEM_RESOLVED",
                "ITEM",
                item.getId(),
                "Item #" + item.getId() + " marked RESOLVED automatically following approved claim #" + claim.getId()
        );

        return mapToClaimResponse(claim);
    }

    @Transactional
    public ClaimResponse rejectClaim(Long claimId, String remark, Admin admin) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found with id: " + claimId));

        if (claim.getStatus() != ClaimStatus.PENDING) {
            throw new BadRequestException("Only PENDING claims can be rejected. This claim is already " + claim.getStatus());
        }

        claim.setStatus(ClaimStatus.REJECTED);
        claim.setAdmin(admin);
        claim.setAdminRemark(StringUtils.hasText(remark) ? remark.trim() : "Rejected by desk administration.");
        claim = claimRepository.save(claim);

        // Notification to claimant
        notificationService.createNotification(
                claim.getClaimant(),
                "Claim Update",
                "Your claim for item \"" + claim.getItem().getTitle() + "\" was reviewed and rejected. Desk remark: " + claim.getAdminRemark()
        );

        // Audit log
        auditLogService.recordLog(
                admin,
                "CLAIM_REJECTED",
                "CLAIM",
                claim.getId(),
                "Rejected claim #" + claim.getId() + " for item #" + claim.getItem().getId() + ". Remark: " + claim.getAdminRemark()
        );

        return mapToClaimResponse(claim);
    }

    private ClaimResponse mapToClaimResponse(Claim claim) {
        ClaimResponse response = new ClaimResponse();
        response.setId(claim.getId());
        response.setItemId(claim.getItem().getId());
        response.setItemTitle(claim.getItem().getTitle());
        response.setItemType(claim.getItem().getType());
        response.setItemStatus(claim.getItem().getStatus());
        response.setClaimantUserId(claim.getClaimant().getId());
        response.setClaimantName(claim.getClaimant().getFullName());
        response.setClaimantEmail(claim.getClaimant().getEmail());
        response.setClaimantDepartment(claim.getClaimant().getDepartment());
        response.setClaimantPhone(claim.getClaimant().getPhone());
        response.setMessage(claim.getMessage());
        response.setStatus(claim.getStatus());
        if (claim.getAdmin() != null) {
            response.setAdminId(claim.getAdmin().getId());
        }
        response.setAdminRemark(claim.getAdminRemark());
        response.setCreatedAt(claim.getCreatedAt());
        response.setUpdatedAt(claim.getUpdatedAt());
        return response;
    }
}
