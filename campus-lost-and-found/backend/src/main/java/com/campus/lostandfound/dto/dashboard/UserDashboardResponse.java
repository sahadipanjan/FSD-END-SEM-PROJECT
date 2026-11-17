package com.campus.lostandfound.dto.dashboard;

import com.campus.lostandfound.dto.claim.ClaimResponse;
import com.campus.lostandfound.dto.item.ItemResponse;

import java.util.List;

public class UserDashboardResponse {
    private long myReportsCount;
    private long myClaimsCount;
    private long unreadNotificationsCount;
    private List<ItemResponse> recentReports;
    private List<ClaimResponse> recentClaims;

    public UserDashboardResponse() {
    }

    public UserDashboardResponse(long myReportsCount, long myClaimsCount, long unreadNotificationsCount, List<ItemResponse> recentReports, List<ClaimResponse> recentClaims) {
        this.myReportsCount = myReportsCount;
        this.myClaimsCount = myClaimsCount;
        this.unreadNotificationsCount = unreadNotificationsCount;
        this.recentReports = recentReports;
        this.recentClaims = recentClaims;
    }

    public long getMyReportsCount() {
        return myReportsCount;
    }

    public void setMyReportsCount(long myReportsCount) {
        this.myReportsCount = myReportsCount;
    }

    public long getMyClaimsCount() {
        return myClaimsCount;
    }

    public void setMyClaimsCount(long myClaimsCount) {
        this.myClaimsCount = myClaimsCount;
    }

    public long getUnreadNotificationsCount() {
        return unreadNotificationsCount;
    }

    public void setUnreadNotificationsCount(long unreadNotificationsCount) {
        this.unreadNotificationsCount = unreadNotificationsCount;
    }

    public List<ItemResponse> getRecentReports() {
        return recentReports;
    }

    public void setRecentReports(List<ItemResponse> recentReports) {
        this.recentReports = recentReports;
    }

    public List<ClaimResponse> getRecentClaims() {
        return recentClaims;
    }

    public void setRecentClaims(List<ClaimResponse> recentClaims) {
        this.recentClaims = recentClaims;
    }
}
