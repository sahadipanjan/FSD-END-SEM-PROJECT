package com.campus.lostandfound.dto.common;

public class PublicStatsResponse {
    private long totalItemsReported;
    private long itemsReturned;
    private long activeUsers;

    public PublicStatsResponse() {
    }

    public PublicStatsResponse(long totalItemsReported, long itemsReturned, long activeUsers) {
        this.totalItemsReported = totalItemsReported;
        this.itemsReturned = itemsReturned;
        this.activeUsers = activeUsers;
    }

    public long getTotalItemsReported() {
        return totalItemsReported;
    }

    public void setTotalItemsReported(long totalItemsReported) {
        this.totalItemsReported = totalItemsReported;
    }

    public long getItemsReturned() {
        return itemsReturned;
    }

    public void setItemsReturned(long itemsReturned) {
        this.itemsReturned = itemsReturned;
    }

    public long getActiveUsers() {
        return activeUsers;
    }

    public void setActiveUsers(long activeUsers) {
        this.activeUsers = activeUsers;
    }
}
