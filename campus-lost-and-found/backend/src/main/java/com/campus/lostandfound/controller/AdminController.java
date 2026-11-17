package com.campus.lostandfound.controller;

import com.campus.lostandfound.dto.claim.ClaimResponse;
import com.campus.lostandfound.dto.claim.ClaimReviewRequest;
import com.campus.lostandfound.dto.common.CategoryDto;
import com.campus.lostandfound.dto.common.LocationDto;
import com.campus.lostandfound.dto.dashboard.AdminDashboardResponse;
import com.campus.lostandfound.dto.item.ItemResponse;
import com.campus.lostandfound.dto.user.*;
import com.campus.lostandfound.entity.Admin;
import com.campus.lostandfound.entity.AuditLog;
import com.campus.lostandfound.entity.ClaimStatus;
import com.campus.lostandfound.entity.ItemStatus;
import com.campus.lostandfound.entity.ItemType;
import com.campus.lostandfound.exception.ResourceNotFoundException;
import com.campus.lostandfound.repository.AdminRepository;
import com.campus.lostandfound.security.UserPrincipal;
import com.campus.lostandfound.service.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@Tag(name = "Administrator Portal", description = "Endpoints for desk administrators to manage users, items, claims, and categories")
public class AdminController {

    private final DashboardService dashboardService;
    private final UserService userService;
    private final ItemService itemService;
    private final ClaimService claimService;
    private final CategoryLocationService categoryLocationService;
    private final AuditLogService auditLogService;
    private final AdminRepository adminRepository;

    public AdminController(DashboardService dashboardService,
                           UserService userService,
                           ItemService itemService,
                           ClaimService claimService,
                           CategoryLocationService categoryLocationService,
                           AuditLogService auditLogService,
                           AdminRepository adminRepository) {
        this.dashboardService = dashboardService;
        this.userService = userService;
        this.itemService = itemService;
        this.claimService = claimService;
        this.categoryLocationService = categoryLocationService;
        this.auditLogService = auditLogService;
        this.adminRepository = adminRepository;
    }

    private Admin getAdminFromPrincipal(UserPrincipal principal) {
        return adminRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Admin account not found"));
    }

    // ==========================================
    // DASHBOARD
    // ==========================================

    @GetMapping("/dashboard")
    @Operation(summary = "Get administrator dashboard metrics, chart data, and recent activity")
    public ResponseEntity<AdminDashboardResponse> getDashboard() {
        return ResponseEntity.ok(dashboardService.getAdminDashboard());
    }

    // ==========================================
    // USER MANAGEMENT
    // ==========================================

    @GetMapping("/users")
    @Operation(summary = "List users with optional search and pagination")
    public ResponseEntity<Page<UserProfileResponse>> getUsers(
            @RequestParam(required = false) String query,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(userService.adminSearchUsers(query, pageable));
    }

    @PatchMapping("/users/{id}/block")
    @Operation(summary = "Suspend a user account")
    public ResponseEntity<UserProfileResponse> blockUser(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        Admin admin = getAdminFromPrincipal(principal);
        return ResponseEntity.ok(userService.adminBlockUser(id, admin));
    }

    @PatchMapping("/users/{id}/unblock")
    @Operation(summary = "Reactivate a suspended user account")
    public ResponseEntity<UserProfileResponse> unblockUser(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        Admin admin = getAdminFromPrincipal(principal);
        return ResponseEntity.ok(userService.adminUnblockUser(id, admin));
    }

    // ==========================================
    // ITEM MANAGEMENT
    // ==========================================

    @GetMapping("/items")
    @Operation(summary = "List all items (including REMOVED) with search, filter, and pagination")
    public ResponseEntity<Page<ItemResponse>> getItems(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) ItemType type,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long locationId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) ItemStatus status,
            @RequestParam(required = false, defaultValue = "newest") String sort,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(itemService.browseItems(query, type, categoryId, locationId, startDate, endDate, status, sort, pageable));
    }

    @PatchMapping("/items/{id}/remove")
    @Operation(summary = "Soft delete an item with administrative reason")
    public ResponseEntity<ItemResponse> removeItem(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        Admin admin = getAdminFromPrincipal(principal);
        String reason = body.getOrDefault("reason", "Flagged by administration");
        return ResponseEntity.ok(itemService.adminRemoveItem(id, reason, admin));
    }

    @PatchMapping("/items/{id}/restore")
    @Operation(summary = "Restore a soft-deleted item to active OPEN status")
    public ResponseEntity<ItemResponse> restoreItem(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        Admin admin = getAdminFromPrincipal(principal);
        return ResponseEntity.ok(itemService.adminRestoreItem(id, admin));
    }

    @PatchMapping("/items/{id}/resolve")
    @Operation(summary = "Mark an item as resolved")
    public ResponseEntity<ItemResponse> resolveItem(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        Admin admin = getAdminFromPrincipal(principal);
        return ResponseEntity.ok(itemService.adminResolveItem(id, admin));
    }

    // ==========================================
    // CLAIMS QUEUE & MEDIATION
    // ==========================================

    @GetMapping("/claims")
    @Operation(summary = "Get claims queue with optional status filter")
    public ResponseEntity<Page<ClaimResponse>> getClaims(
            @RequestParam(required = false) ClaimStatus status,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(claimService.getClaimsQueue(status, pageable));
    }

    @PatchMapping("/claims/{id}/approve")
    @Operation(summary = "Approve claim (resolves item and auto-rejects competing claims)")
    public ResponseEntity<ClaimResponse> approveClaim(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @RequestBody(required = false) ClaimReviewRequest request) {
        Admin admin = getAdminFromPrincipal(principal);
        String remark = (request != null && request.getRemark() != null) ? request.getRemark() : "Approved by desk administration";
        return ResponseEntity.ok(claimService.approveClaim(id, remark, admin));
    }

    @PatchMapping("/claims/{id}/reject")
    @Operation(summary = "Reject claim with administrative remark")
    public ResponseEntity<ClaimResponse> rejectClaim(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody ClaimReviewRequest request) {
        Admin admin = getAdminFromPrincipal(principal);
        return ResponseEntity.ok(claimService.rejectClaim(id, request.getRemark(), admin));
    }

    // ==========================================
    // CATEGORIES & LOCATIONS CRUD
    // ==========================================

    @GetMapping("/categories")
    @Operation(summary = "List all categories")
    public ResponseEntity<List<CategoryDto>> getCategories() {
        return ResponseEntity.ok(categoryLocationService.getAllCategories());
    }

    @PostMapping("/categories")
    @Operation(summary = "Create a new category")
    public ResponseEntity<CategoryDto> createCategory(@Valid @RequestBody CategoryDto dto) {
        return new ResponseEntity<>(categoryLocationService.createCategory(dto), HttpStatus.CREATED);
    }

    @PutMapping("/categories/{id}")
    @Operation(summary = "Update an existing category")
    public ResponseEntity<CategoryDto> updateCategory(@PathVariable Long id, @Valid @RequestBody CategoryDto dto) {
        return ResponseEntity.ok(categoryLocationService.updateCategory(id, dto));
    }

    @DeleteMapping("/categories/{id}")
    @Operation(summary = "Delete category (blocked if items are assigned)")
    public ResponseEntity<Map<String, String>> deleteCategory(@PathVariable Long id) {
        categoryLocationService.deleteCategory(id);
        return ResponseEntity.ok(Map.of("message", "Category deleted successfully"));
    }

    @GetMapping("/locations")
    @Operation(summary = "List all locations")
    public ResponseEntity<List<LocationDto>> getLocations() {
        return ResponseEntity.ok(categoryLocationService.getAllLocations());
    }

    @PostMapping("/locations")
    @Operation(summary = "Create a new campus location")
    public ResponseEntity<LocationDto> createLocation(@Valid @RequestBody LocationDto dto) {
        return new ResponseEntity<>(categoryLocationService.createLocation(dto), HttpStatus.CREATED);
    }

    @PutMapping("/locations/{id}")
    @Operation(summary = "Update an existing location")
    public ResponseEntity<LocationDto> updateLocation(@PathVariable Long id, @Valid @RequestBody LocationDto dto) {
        return ResponseEntity.ok(categoryLocationService.updateLocation(id, dto));
    }

    @DeleteMapping("/locations/{id}")
    @Operation(summary = "Delete location (blocked if items are assigned)")
    public ResponseEntity<Map<String, String>> deleteLocation(@PathVariable Long id) {
        categoryLocationService.deleteLocation(id);
        return ResponseEntity.ok(Map.of("message", "Location deleted successfully"));
    }

    // ==========================================
    // AUDIT LOGS
    // ==========================================

    @GetMapping("/audit-logs")
    @Operation(summary = "View immutable administrative audit trail")
    public ResponseEntity<Page<AuditLog>> getAuditLogs(
            @PageableDefault(size = 15, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(auditLogService.getAuditLogs(pageable));
    }

    // ==========================================
    // ADMIN PROFILE
    // ==========================================

    @GetMapping("/profile")
    @Operation(summary = "Get administrator profile")
    public ResponseEntity<AdminProfileResponse> getProfile(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(userService.getAdminProfile(principal.getId()));
    }

    @PutMapping("/profile")
    @Operation(summary = "Update administrator profile")
    public ResponseEntity<AdminProfileResponse> updateProfile(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody AdminProfileUpdateRequest request) {
        return ResponseEntity.ok(userService.updateAdminProfile(principal.getId(), request));
    }

    @PutMapping("/change-password")
    @Operation(summary = "Change administrator password")
    public ResponseEntity<Map<String, String>> changePassword(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ChangePasswordRequest request) {
        userService.changeAdminPassword(principal.getId(), request);
        return ResponseEntity.ok(Map.of("message", "Administrator password changed successfully"));
    }
}
