package com.campus.lostandfound.dto.auth;

public class AuthResponse {
    private String token;
    private String role; // "ROLE_USER" or "ROLE_ADMIN"
    private Long id;
    private String email;
    private String fullName;
    private String department;
    private String userType; // "USER" or "ADMIN"

    public AuthResponse() {
    }

    public AuthResponse(String token, String role, Long id, String email, String fullName, String department, String userType) {
        this.token = token;
        this.role = role;
        this.id = id;
        this.email = email;
        this.fullName = fullName;
        this.department = department;
        this.userType = userType;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getUserType() {
        return userType;
    }

    public void setUserType(String userType) {
        this.userType = userType;
    }
}
