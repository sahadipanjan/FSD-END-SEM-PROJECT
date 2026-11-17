package com.campus.lostandfound.controller;

import com.campus.lostandfound.dto.claim.ClaimCreateRequest;
import com.campus.lostandfound.dto.claim.ClaimResponse;
import com.campus.lostandfound.dto.dashboard.UserDashboardResponse;
import com.campus.lostandfound.dto.item.ItemCreateRequest;
import com.campus.lostandfound.dto.item.ItemResponse;
import com.campus.lostandfound.dto.item.ItemSuggestionResponse;
import com.campus.lostandfound.dto.item.ItemUpdateRequest;
import com.campus.lostandfound.dto.user.ChangePasswordRequest;
import com.campus.lostandfound.dto.user.UserProfileResponse;
import com.campus.lostandfound.dto.user.UserProfileUpdateRequest;
import com.campus.lostandfound.entity.ItemStatus;
import com.campus.lostandfound.entity.ItemType;
import com.campus.lostandfound.entity.Notification;
import com.campus.lostandfound.security.UserPrincipal;
import com.campus.lostandfound.service.ClaimService;
import com.campus.lostandfound.service.DashboardService;
import com.campus.lostandfound.service.ItemService;
import com.campus.lostandfound.service.NotificationService;
import com.campus.lostandfound.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
@Tag(name = "User Portal", description = "Endpoints for students and staff to manage reports, claims, and profile")
public class UserController {

    private final UserService userService;
    private final ItemService itemService;
    private final ClaimService claimService;
    private final NotificationService notificationService;
    private final DashboardService dashboardService;

    public UserController(UserService userService,
                          ItemService itemService,
                          ClaimService claimService,
                          NotificationService notificationService,
                          DashboardService dashboardService) {
        this.userService = userService;
        this.itemService = itemService;
        this.claimService = claimService;
        this.notificationService = notificationService;
        this.dashboardService = dashboardService;
    }

    // ==========================================
    // USER PROFILE
    // ==========================================

    @GetMapping("/profile")
    @Operation(summary = "Get current user profile")
    public ResponseEntity<UserProfileResponse> getProfile(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(userService.getUserProfile(principal.getId()));
    }

    @PutMapping("/profile")
    @Operation(summary = "Update user profile details")
    public ResponseEntity<UserProfileResponse> updateProfile(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody UserProfileUpdateRequest request) {
        return ResponseEntity.ok(userService.updateUserProfile(principal.getId(), request));
    }

    @PutMapping("/change-password")
    @Operation(summary = "Change account password")
    public ResponseEntity<Map<String, String>> changePassword(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ChangePasswordRequest request) {
        userService.changeUserPassword(principal.getId(), request);
        return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
    }

    // ==========================================
    // ITEMS BROWSE & MANAGEMENT
    // ==========================================

    @GetMapping("/items")
    @Operation(summary = "Browse all active lost and found items with search, filters, and pagination")
    public ResponseEntity<Page<ItemResponse>> browseItems(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) ItemType type,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long locationId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) ItemStatus status,
            @RequestParam(required = false, defaultValue = "newest") String sort,
            @PageableDefault(size = 9, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(itemService.browseItems(query, type, categoryId, locationId, startDate, endDate, status, sort, pageable));
    }

    @GetMapping("/items/{id}")
    @Operation(summary = "Get single item details")
    public ResponseEntity<ItemResponse> getItemById(@PathVariable Long id) {
        return ResponseEntity.ok(itemService.getItemById(id));
    }

    @PostMapping(value = "/items", consumes = { MediaType.MULTIPART_FORM_DATA_VALUE })
    @Operation(summary = "Report a new Lost or Found item (with optional photo upload)")
    public ResponseEntity<ItemResponse> createItem(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @ModelAttribute ItemCreateRequest request,
            @RequestPart(value = "image", required = false) MultipartFile file) {
        ItemResponse response = itemService.createItem(request, file, principal.getId());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping(value = "/items/{id}", consumes = { MediaType.MULTIPART_FORM_DATA_VALUE })
    @Operation(summary = "Update an item previously reported by current user")
    public ResponseEntity<ItemResponse> updateItem(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @ModelAttribute ItemUpdateRequest request,
            @RequestPart(value = "image", required = false) MultipartFile file) {
        ItemResponse response = itemService.updateItem(id, request, file, principal.getId());
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/items/{id}")
    @Operation(summary = "Delete an item previously reported by current user")
    public ResponseEntity<Map<String, String>> deleteItem(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        itemService.deleteItem(id, principal.getId());
        return ResponseEntity.ok(Map.of("message", "Item deleted successfully"));
    }

    @PatchMapping("/items/{id}/resolve")
    @Operation(summary = "Mark own reported item as resolved")
    public ResponseEntity<ItemResponse> resolveItem(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        return ResponseEntity.ok(itemService.resolveItemByUser(id, principal.getId()));
    }

    @GetMapping("/items/mine")
    @Operation(summary = "List items reported by current user")
    public ResponseEntity<Page<ItemResponse>> getMyItems(
            @AuthenticationPrincipal UserPrincipal principal,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(itemService.getMyItems(principal.getId(), pageable));
    }

    @GetMapping("/items/{id}/suggestions")
    @Operation(summary = "Get smart suggestions for a reported lost item")
    public ResponseEntity<List<ItemSuggestionResponse>> getSuggestions(@PathVariable Long id) {
        return ResponseEntity.ok(itemService.getSuggestions(id));
    }

    // ==========================================
    // CLAIMS
    // ==========================================

    @PostMapping("/items/{id}/claims")
    @Operation(summary = "Submit a claim or found match on an item")
    public ResponseEntity<ClaimResponse> submitClaim(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody ClaimCreateRequest request) {
        ClaimResponse response = claimService.submitClaim(id, request, principal.getId());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/claims/mine")
    @Operation(summary = "List claims submitted by current user")
    public ResponseEntity<Page<ClaimResponse>> getMyClaims(
            @AuthenticationPrincipal UserPrincipal principal,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(claimService.getMyClaims(principal.getId(), pageable));
    }

    // ==========================================
    // NOTIFICATIONS
    // ==========================================

    @GetMapping("/notifications")
    @Operation(summary = "List in-app notifications for current user")
    public ResponseEntity<Page<Notification>> getNotifications(
            @AuthenticationPrincipal UserPrincipal principal,
            @PageableDefault(size = 15, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(notificationService.getUserNotifications(principal.getId(), pageable));
    }

    @PatchMapping("/notifications/{id}/read")
    @Operation(summary = "Mark single notification as read")
    public ResponseEntity<Map<String, String>> markNotificationRead(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        notificationService.markAsRead(id, principal.getId());
        return ResponseEntity.ok(Map.of("message", "Notification marked as read"));
    }

    @PatchMapping("/notifications/read-all")
    @Operation(summary = "Mark all unread notifications as read")
    public ResponseEntity<Map<String, String>> markAllNotificationsRead(
            @AuthenticationPrincipal UserPrincipal principal) {
        notificationService.markAllAsRead(principal.getId());
        return ResponseEntity.ok(Map.of("message", "All notifications marked as read"));
    }

    @GetMapping("/notifications/unread-count")
    @Operation(summary = "Get count of unread notifications")
    public ResponseEntity<Map<String, Long>> getUnreadCount(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(Map.of("unreadCount", notificationService.getUnreadCount(principal.getId())));
    }

    // ==========================================
    // DASHBOARD
    // ==========================================

    @GetMapping("/dashboard")
    @Operation(summary = "Get user dashboard statistics and recent activity")
    public ResponseEntity<UserDashboardResponse> getDashboard(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(dashboardService.getUserDashboard(principal.getId()));
    }
}
