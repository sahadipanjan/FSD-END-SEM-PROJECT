package com.campus.lostandfound.controller;

import com.campus.lostandfound.dto.common.CategoryDto;
import com.campus.lostandfound.dto.common.LocationDto;
import com.campus.lostandfound.dto.common.PublicStatsResponse;
import com.campus.lostandfound.service.CategoryLocationService;
import com.campus.lostandfound.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/public")
@Tag(name = "Public Information", description = "Public statistics, categories, and campus locations")
public class PublicController {

    private final DashboardService dashboardService;
    private final CategoryLocationService categoryLocationService;

    public PublicController(DashboardService dashboardService,
                            CategoryLocationService categoryLocationService) {
        this.dashboardService = dashboardService;
        this.categoryLocationService = categoryLocationService;
    }

    @GetMapping("/stats")
    @Operation(summary = "Get live public portal statistics")
    public ResponseEntity<PublicStatsResponse> getPublicStats() {
        return ResponseEntity.ok(dashboardService.getPublicStats());
    }

    @GetMapping("/categories")
    @Operation(summary = "List all active item categories")
    public ResponseEntity<List<CategoryDto>> getCategories() {
        return ResponseEntity.ok(categoryLocationService.getAllCategories());
    }

    @GetMapping("/locations")
    @Operation(summary = "List all active campus locations")
    public ResponseEntity<List<LocationDto>> getLocations() {
        return ResponseEntity.ok(categoryLocationService.getAllLocations());
    }
}
