package com.campus.lostandfound.dto.dashboard;

import com.campus.lostandfound.dto.claim.ClaimResponse;
import com.campus.lostandfound.dto.item.ItemResponse;

import java.util.List;
import java.util.Map;

public class AdminDashboardResponse {
    private long totalUsers;
    private long totalItems;
    private long lostItemsCount;
    private long foundItemsCount;
    private long pendingClaimsCount;
    private long resolvedItemsCount;
    private List<Map<String, Object>> categoryStats;
    private List<ItemResponse> recentItems;
    private List<ClaimResponse> recentClaims;

    public AdminDashboardResponse() {
    }

    public long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public long getTotalItems() {
        return totalItems;
    }

    public void setTotalItems(long totalItems) {
        this.totalItems = totalItems;
    }

    public long getLostItemsCount() {
        return lostItemsCount;
    }

    public void setLostItemsCount(long lostItemsCount) {
        this.lostItemsCount = lostItemsCount;
    }

    public long getFoundItemsCount() {
        return foundItemsCount;
    }

    public void setFoundItemsCount(long foundItemsCount) {
        this.foundItemsCount = foundItemsCount;
    }

    public long getPendingClaimsCount() {
        return pendingClaimsCount;
    }

    public void setPendingClaimsCount(long pendingClaimsCount) {
        this.pendingClaimsCount = pendingClaimsCount;
    }

    public long getResolvedItemsCount() {
        return resolvedItemsCount;
    }

    public void setResolvedItemsCount(long resolvedItemsCount) {
        this.resolvedItemsCount = resolvedItemsCount;
    }

    public List<Map<String, Object>> getCategoryStats() {
        return categoryStats;
    }

    public void setCategoryStats(List<Map<String, Object>> categoryStats) {
        this.categoryStats = categoryStats;
    }

    public List<ItemResponse> getRecentItems() {
        return recentItems;
    }

    public void setRecentItems(List<ItemResponse> recentItems) {
        this.recentItems = recentItems;
    }

    public List<ClaimResponse> getRecentClaims() {
        return recentClaims;
    }

    public void setRecentClaims(List<ClaimResponse> recentClaims) {
        this.recentClaims = recentClaims;
    }
}
