package com.campus.lostandfound.dto.claim;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ClaimReviewRequest {

    @NotBlank(message = "Remark is required")
    @Size(max = 255, message = "Remark must not exceed 255 characters")
    private String remark;

    public ClaimReviewRequest() {
    }

    public ClaimReviewRequest(String remark) {
        this.remark = remark;
    }

    public String getRemark() {
        return remark;
    }

    public void setRemark(String remark) {
        this.remark = remark;
    }
}
