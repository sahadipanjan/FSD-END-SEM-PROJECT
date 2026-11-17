package com.campus.lostandfound.service;

import com.campus.lostandfound.dto.item.ItemCreateRequest;
import com.campus.lostandfound.dto.item.ItemResponse;
import com.campus.lostandfound.dto.item.ItemSuggestionResponse;
import com.campus.lostandfound.dto.item.ItemUpdateRequest;
import com.campus.lostandfound.entity.Admin;
import com.campus.lostandfound.entity.Category;
import com.campus.lostandfound.entity.Item;
import com.campus.lostandfound.entity.ItemStatus;
import com.campus.lostandfound.entity.ItemType;
import com.campus.lostandfound.entity.Location;
import com.campus.lostandfound.entity.User;
import com.campus.lostandfound.exception.BadRequestException;
import com.campus.lostandfound.exception.ForbiddenException;
import com.campus.lostandfound.exception.ResourceNotFoundException;
import com.campus.lostandfound.repository.CategoryRepository;
import com.campus.lostandfound.repository.ItemRepository;
import com.campus.lostandfound.repository.LocationRepository;
import com.campus.lostandfound.repository.UserRepository;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ItemService {

    private final ItemRepository itemRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final LocationRepository locationRepository;
    private final FileStorageService fileStorageService;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;

    private static final Set<String> STOP_WORDS = Set.of(
            "this", "that", "with", "from", "have", "were", "been", "there",
            "their", "about", "which", "could", "would", "near", "left", "lost",
            "found", "item", "please", "help", "some", "black", "color", "side"
    );

    public ItemService(ItemRepository itemRepository,
                       UserRepository userRepository,
                       CategoryRepository categoryRepository,
                       LocationRepository locationRepository,
                       FileStorageService fileStorageService,
                       NotificationService notificationService,
                       AuditLogService auditLogService) {
        this.itemRepository = itemRepository;
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.locationRepository = locationRepository;
        this.fileStorageService = fileStorageService;
        this.notificationService = notificationService;
        this.auditLogService = auditLogService;
    }

    @Transactional
    public ItemResponse createItem(ItemCreateRequest request, MultipartFile file, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        Location location = locationRepository.findById(request.getLocationId())
                .orElseThrow(() -> new ResourceNotFoundException("Location not found with id: " + request.getLocationId()));

        String imagePath = null;
        if (file != null && !file.isEmpty()) {
            imagePath = fileStorageService.storeFile(file);
        }

        Item item = new Item();
        item.setType(request.getType());
        item.setTitle(request.getTitle().trim());
        item.setDescription(request.getDescription().trim());
        item.setCategory(category);
        item.setLocation(location);
        item.setEventDate(request.getEventDate());
        item.setImagePath(imagePath);
        item.setContactPreference(request.getContactPreference());
        item.setStatus(ItemStatus.OPEN);
        item.setReportedBy(user);

        item = itemRepository.save(item);
        return mapToItemResponse(item);
    }

    @Transactional
    public ItemResponse updateItem(Long itemId, ItemUpdateRequest request, MultipartFile file, Long userId) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found with id: " + itemId));

        if (!item.getReportedBy().getId().equals(userId)) {
            throw new ForbiddenException("You are only permitted to update items reported by your account");
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        Location location = locationRepository.findById(request.getLocationId())
                .orElseThrow(() -> new ResourceNotFoundException("Location not found with id: " + request.getLocationId()));

        if (file != null && !file.isEmpty()) {
            if (item.getImagePath() != null) {
                fileStorageService.deleteFile(item.getImagePath());
            }
            String newImagePath = fileStorageService.storeFile(file);
            item.setImagePath(newImagePath);
        }

        item.setTitle(request.getTitle().trim());
        item.setDescription(request.getDescription().trim());
        item.setCategory(category);
        item.setLocation(location);
        item.setEventDate(request.getEventDate());
        item.setContactPreference(request.getContactPreference());

        item = itemRepository.save(item);
        return mapToItemResponse(item);
    }

    @Transactional
    public void deleteItem(Long itemId, Long userId) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found with id: " + itemId));

        if (!item.getReportedBy().getId().equals(userId)) {
            throw new ForbiddenException("You are only permitted to delete items reported by your account");
        }

        if (item.getImagePath() != null) {
            fileStorageService.deleteFile(item.getImagePath());
        }

        itemRepository.delete(item);
    }

    @Transactional
    public ItemResponse resolveItemByUser(Long itemId, Long userId) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found with id: " + itemId));

        if (!item.getReportedBy().getId().equals(userId)) {
            throw new ForbiddenException("You are only permitted to resolve items reported by your account");
        }

        item.setStatus(ItemStatus.RESOLVED);
        item = itemRepository.save(item);
        return mapToItemResponse(item);
    }

    public ItemResponse getItemById(Long itemId) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found with id: " + itemId));
        return mapToItemResponse(item);
    }

    public Page<ItemResponse> getMyItems(Long userId, Pageable pageable) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return itemRepository.findByReportedByOrderByCreatedAtDesc(user, pageable)
                .map(this::mapToItemResponse);
    }

    public Page<ItemResponse> browseItems(String query,
                                          ItemType type,
                                          Long categoryId,
                                          Long locationId,
                                          LocalDate startDate,
                                          LocalDate endDate,
                                          ItemStatus status,
                                          String sortOrder,
                                          Pageable pageable) {

        Specification<Item> spec = (root, q, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (type != null) {
                predicates.add(cb.equal(root.get("type"), type));
            }

            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            } else {
                // By default for public/user browsing, exclude REMOVED items
                predicates.add(cb.notEqual(root.get("status"), ItemStatus.REMOVED));
            }

            if (categoryId != null) {
                predicates.add(cb.equal(root.get("category").get("id"), categoryId));
            }

            if (locationId != null) {
                predicates.add(cb.equal(root.get("location").get("id"), locationId));
            }

            if (startDate != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("eventDate"), startDate));
            }

            if (endDate != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("eventDate"), endDate));
            }

            if (StringUtils.hasText(query)) {
                String likePattern = "%" + query.trim().toLowerCase() + "%";
                Predicate titleMatch = cb.like(cb.lower(root.get("title")), likePattern);
                Predicate descMatch = cb.like(cb.lower(root.get("description")), likePattern);
                predicates.add(cb.or(titleMatch, descMatch));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        // Determine sorting
        Sort sort = Sort.by(Sort.Direction.DESC, "eventDate", "createdAt");
        if ("oldest".equalsIgnoreCase(sortOrder)) {
            sort = Sort.by(Sort.Direction.ASC, "eventDate", "createdAt");
        }

        Pageable sortedPageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), sort);
        return itemRepository.findAll(spec, sortedPageable).map(this::mapToItemResponse);
    }

    public List<ItemSuggestionResponse> getSuggestions(Long itemId) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found with id: " + itemId));

        // Suggestions are primarily for LOST items searching candidate FOUND items
        ItemType targetType = (item.getType() == ItemType.LOST) ? ItemType.FOUND : ItemType.LOST;

        // Fetch open candidate items with target type and same category
        List<Item> candidates = itemRepository.findByTypeAndStatusAndCategory(
                targetType, ItemStatus.OPEN, item.getCategory()
        );

        Set<String> sourceKeywords = extractKeywords(item.getTitle() + " " + item.getDescription());

        List<ItemSuggestionResponse> scoredList = new ArrayList<>();

        for (Item candidate : candidates) {
            if (candidate.getId().equals(item.getId())) {
                continue;
            }

            int score = 50; // Base score for category match
            List<String> reasons = new ArrayList<>();
            reasons.add("Same category (" + item.getCategory().getName() + ")");

            // Location match
            if (candidate.getLocation().getId().equals(item.getLocation().getId())) {
                score += 20;
                reasons.add("Matching location (" + item.getLocation().getName() + ")");
            }

            // Date proximity
            long daysApart = Math.abs(ChronoUnit.DAYS.between(item.getEventDate(), candidate.getEventDate()));
            if (daysApart <= 3) {
                score += 30;
                reasons.add("Date within " + daysApart + " day(s)");
            } else if (daysApart <= 7) {
                score += 20;
                reasons.add("Date within 1 week");
            } else if (daysApart <= 14) {
                score += 10;
                reasons.add("Date within 2 weeks");
            }

            // Keyword overlap
            Set<String> candidateKeywords = extractKeywords(candidate.getTitle() + " " + candidate.getDescription());
            long keywordMatches = candidateKeywords.stream().filter(sourceKeywords::contains).count();
            if (keywordMatches > 0) {
                int keywordBonus = (int) Math.min(keywordMatches * 10, 50);
                score += keywordBonus;
                reasons.add(keywordMatches + " keyword overlap(s)");
            }

            scoredList.add(new ItemSuggestionResponse(
                    mapToItemResponse(candidate),
                    score,
                    String.join(", ", reasons)
            ));
        }

        // Sort by score descending, then date descending
        scoredList.sort((a, b) -> {
            int scoreCompare = Integer.compare(b.getMatchScore(), a.getMatchScore());
            if (scoreCompare != 0) return scoreCompare;
            return b.getItem().getEventDate().compareTo(a.getItem().getEventDate());
        });

        // Return up to 5
        return scoredList.stream().limit(5).collect(Collectors.toList());
    }

    private Set<String> extractKeywords(String text) {
        if (!StringUtils.hasText(text)) {
            return Collections.emptySet();
        }
        return Arrays.stream(text.toLowerCase().split("[^a-zA-Z0-9]+"))
                .filter(w -> w.length() >= 4)
                .filter(w -> !STOP_WORDS.contains(w))
                .collect(Collectors.toSet());
    }

    // ==========================================
    // ADMIN ITEM OPERATIONS
    // ==========================================

    @Transactional
    public ItemResponse adminRemoveItem(Long itemId, String reason, Admin admin) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found with id: " + itemId));

        if (!StringUtils.hasText(reason)) {
            throw new BadRequestException("Removal reason is required");
        }

        item.setStatus(ItemStatus.REMOVED);
        item.setRemovalReason(reason.trim());
        item = itemRepository.save(item);

        notificationService.createNotification(
                item.getReportedBy(),
                "Item Removed by Administration",
                "Your reported item \"" + item.getTitle() + "\" was removed by desk staff. Reason: " + reason.trim()
        );

        auditLogService.recordLog(
                admin,
                "ITEM_REMOVED",
                "ITEM",
                item.getId(),
                "Removed item #" + item.getId() + " (" + item.getTitle() + "). Reason: " + reason.trim()
        );

        return mapToItemResponse(item);
    }

    @Transactional
    public ItemResponse adminRestoreItem(Long itemId, Admin admin) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found with id: " + itemId));

        item.setStatus(ItemStatus.OPEN);
        item.setRemovalReason(null);
        item = itemRepository.save(item);

        notificationService.createNotification(
                item.getReportedBy(),
                "Item Restored",
                "Your reported item \"" + item.getTitle() + "\" has been reinstated to active status."
        );

        auditLogService.recordLog(
                admin,
                "ITEM_RESTORED",
                "ITEM",
                item.getId(),
                "Restored item #" + item.getId() + " (" + item.getTitle() + ") to active status"
        );

        return mapToItemResponse(item);
    }

    @Transactional
    public ItemResponse adminResolveItem(Long itemId, Admin admin) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found with id: " + itemId));

        item.setStatus(ItemStatus.RESOLVED);
        item = itemRepository.save(item);

        notificationService.createNotification(
                item.getReportedBy(),
                "Item Marked as Resolved",
                "Your reported item \"" + item.getTitle() + "\" was marked as RESOLVED by campus desk staff."
        );

        auditLogService.recordLog(
                admin,
                "ITEM_RESOLVED",
                "ITEM",
                item.getId(),
                "Marked item #" + item.getId() + " (" + item.getTitle() + ") as RESOLVED"
        );

        return mapToItemResponse(item);
    }

    public ItemResponse mapToItemResponse(Item item) {
        ItemResponse response = new ItemResponse();
        response.setId(item.getId());
        response.setType(item.getType());
        response.setTitle(item.getTitle());
        response.setDescription(item.getDescription());
        response.setCategoryId(item.getCategory().getId());
        response.setCategoryName(item.getCategory().getName());
        response.setLocationId(item.getLocation().getId());
        response.setLocationName(item.getLocation().getName());
        response.setEventDate(item.getEventDate());
        response.setImagePath(item.getImagePath());
        response.setContactPreference(item.getContactPreference());
        response.setStatus(item.getStatus());
        response.setReportedByUserId(item.getReportedBy().getId());
        response.setReportedByName(item.getReportedBy().getFullName());
        response.setReportedByEmail(item.getReportedBy().getEmail());
        response.setReportedByDepartment(item.getReportedBy().getDepartment());
        response.setRemovalReason(item.getRemovalReason());
        response.setCreatedAt(item.getCreatedAt());
        response.setUpdatedAt(item.getUpdatedAt());
        return response;
    }
}
