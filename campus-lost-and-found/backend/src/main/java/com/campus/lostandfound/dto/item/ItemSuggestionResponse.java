package com.campus.lostandfound.dto.item;

public class ItemSuggestionResponse {
    private ItemResponse item;
    private int matchScore;
    private String matchReason;

    public ItemSuggestionResponse() {
    }

    public ItemSuggestionResponse(ItemResponse item, int matchScore, String matchReason) {
        this.item = item;
        this.matchScore = matchScore;
        this.matchReason = matchReason;
    }

    public ItemResponse getItem() {
        return item;
    }

    public void setItem(ItemResponse item) {
        this.item = item;
    }

    public int getMatchScore() {
        return matchScore;
    }

    public void setMatchScore(int matchScore) {
        this.matchScore = matchScore;
    }

    public String getMatchReason() {
        return matchReason;
    }

    public void setMatchReason(String matchReason) {
        this.matchReason = matchReason;
    }
}
