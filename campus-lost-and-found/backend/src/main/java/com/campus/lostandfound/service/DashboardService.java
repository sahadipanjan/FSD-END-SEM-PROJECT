package com.campus.lostandfound.service;

import com.campus.lostandfound.dto.common.PublicStatsResponse;
import com.campus.lostandfound.dto.dashboard.AdminDashboardResponse;
import com.campus.lostandfound.dto.dashboard.UserDashboardResponse;
import com.campus.lostandfound.entity.ClaimStatus;
import com.campus.lostandfound.entity.ItemStatus;
import com.campus.lostandfound.entity.ItemType;
import com.campus.lostandfound.entity.User;
import com.campus.lostandfound.exception.ResourceNotFoundException;
import com.campus.lostandfound.repository.ClaimRepository;
import com.campus.lostandfound.repository.ItemRepository;
import com.campus.lostandfound.repository.NotificationRepository;
import com.campus.lostandfound.repository.UserRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class DashboardService {

    private final UserRepository userRepository;
    private final ItemRepository itemRepository;
    private final ClaimRepository claimRepository;
    private final NotificationRepository notificationRepository;
    private final ItemService itemService;

    public DashboardService(UserRepository userRepository,
                            ItemRepository itemRepository,
                            ClaimRepository claimRepository,
                            NotificationRepository notificationRepository,
                            ItemService itemService) {
        this.userRepository = userRepository;
        this.itemRepository = itemRepository;
        this.claimRepository = claimRepository;
        this.notificationRepository = notificationRepository;
        this.itemService = itemService;
    }

    public PublicStatsResponse getPublicStats() {
        long totalItems = itemRepository.count();
        long resolvedItems = itemRepository.countByStatus(ItemStatus.RESOLVED);
        long totalUsers = userRepository.count();

        return new PublicStatsResponse(totalItems, resolvedItems, totalUsers);
    }

    public UserDashboardResponse getUserDashboard(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        long myReports = itemRepository.countByReportedBy(user);
        long myClaims = claimRepository.countByClaimant(user);
        long unreadNotifications = notificationRepository.countByUserAndReadFalse(user);

        var recentReports = itemRepository.findByReportedByOrderByCreatedAtDesc(user, PageRequest.of(0, 5))
                .map(itemService::mapToItemResponse)
                .getContent();

        var recentClaims = claimRepository.findByClaimantOrderByCreatedAtDesc(user, PageRequest.of(0, 5))
                .map(claim -> {
                    var r = new com.campus.lostandfound.dto.claim.ClaimResponse();
                    r.setId(claim.getId());
                    r.setItemId(claim.getItem().getId());
                    r.setItemTitle(claim.getItem().getTitle());
                    r.setItemType(claim.getItem().getType());
                    r.setItemStatus(claim.getItem().getStatus());
                    r.setClaimantUserId(user.getId());
                    r.setClaimantName(user.getFullName());
                    r.setClaimantEmail(user.getEmail());
                    r.setMessage(claim.getMessage());
                    r.setStatus(claim.getStatus());
                    r.setAdminRemark(claim.getAdminRemark());
                    r.setCreatedAt(claim.getCreatedAt());
                    r.setUpdatedAt(claim.getUpdatedAt());
                    return r;
                })
                .getContent();

        return new UserDashboardResponse(myReports, myClaims, unreadNotifications, recentReports, recentClaims);
    }

    public AdminDashboardResponse getAdminDashboard() {
        long totalUsers = userRepository.count();
        long totalItems = itemRepository.count();
        long lostItems = itemRepository.countByType(ItemType.LOST);
        long foundItems = itemRepository.countByType(ItemType.FOUND);
        long pendingClaims = claimRepository.countByStatus(ClaimStatus.PENDING);
        long resolvedItems = itemRepository.countByStatus(ItemStatus.RESOLVED);

        List<Map<String, Object>> categoryStats = new ArrayList<>();
        List<Object[]> rawCategoryStats = itemRepository.countItemsByCategory();
        for (Object[] row : rawCategoryStats) {
            Map<String, Object> map = new HashMap<>();
            map.put("name", row[0]);
            map.put("count", row[1]);
            categoryStats.add(map);
        }

        var recentItems = itemRepository.findTop5ByOrderByCreatedAtDesc().stream()
                .map(itemService::mapToItemResponse)
                .toList();

        var recentClaims = claimRepository.findTop5ByOrderByCreatedAtDesc().stream()
                .map(claim -> {
                    var r = new com.campus.lostandfound.dto.claim.ClaimResponse();
                    r.setId(claim.getId());
                    r.setItemId(claim.getItem().getId());
                    r.setItemTitle(claim.getItem().getTitle());
                    r.setItemType(claim.getItem().getType());
                    r.setItemStatus(claim.getItem().getStatus());
                    r.setClaimantUserId(claim.getClaimant().getId());
                    r.setClaimantName(claim.getClaimant().getFullName());
                    r.setClaimantEmail(claim.getClaimant().getEmail());
                    r.setMessage(claim.getMessage());
                    r.setStatus(claim.getStatus());
                    r.setAdminRemark(claim.getAdminRemark());
                    r.setCreatedAt(claim.getCreatedAt());
                    r.setUpdatedAt(claim.getUpdatedAt());
                    return r;
                })
                .toList();

        AdminDashboardResponse response = new AdminDashboardResponse();
        response.setTotalUsers(totalUsers);
        response.setTotalItems(totalItems);
        response.setLostItemsCount(lostItems);
        response.setFoundItemsCount(foundItems);
        response.setPendingClaimsCount(pendingClaims);
        response.setResolvedItemsCount(resolvedItems);
        response.setCategoryStats(categoryStats);
        response.setRecentItems(recentItems);
        response.setRecentClaims(recentClaims);

        return response;
    }
}
