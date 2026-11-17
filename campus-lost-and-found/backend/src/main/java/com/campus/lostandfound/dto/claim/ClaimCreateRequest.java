package com.campus.lostandfound.dto.claim;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ClaimCreateRequest {

    @NotBlank(message = "Message and proof details are required")
    @Size(min = 10, max = 2000, message = "Proof description must be between 10 and 2000 characters")
    private String message;

    public ClaimCreateRequest() {
    }

    public ClaimCreateRequest(String message) {
        this.message = message;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
