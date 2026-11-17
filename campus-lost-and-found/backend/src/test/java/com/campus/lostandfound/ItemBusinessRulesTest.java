package com.campus.lostandfound;

import com.campus.lostandfound.dto.claim.ClaimCreateRequest;
import com.campus.lostandfound.dto.claim.ClaimResponse;
import com.campus.lostandfound.dto.common.CategoryDto;
import com.campus.lostandfound.dto.item.ItemSuggestionResponse;
import com.campus.lostandfound.entity.*;
import com.campus.lostandfound.exception.BadRequestException;
import com.campus.lostandfound.repository.*;
import com.campus.lostandfound.service.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ItemBusinessRulesTest {

    @Mock
    private ClaimRepository claimRepository;

    @Mock
    private ItemRepository itemRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private LocationRepository locationRepository;

    @Mock
    private NotificationService notificationService;

    @Mock
    private AuditLogService auditLogService;

    @Mock
    private FileStorageService fileStorageService;

    @InjectMocks
    private ClaimService claimService;

    @Test
    public void testUserCannotClaimOwnReportedItem() {
        User alice = new User("Alice", "alice@campus.edu", "pass", "CS", null);
        alice.setId(1L);

        Item item = new Item();
        item.setId(100L);
        item.setTitle("My Backpack");
        item.setReportedBy(alice);
        item.setStatus(ItemStatus.OPEN);

        when(userRepository.findById(1L)).thenReturn(Optional.of(alice));
        when(itemRepository.findById(100L)).thenReturn(Optional.of(item));

        ClaimCreateRequest req = new ClaimCreateRequest("This is mine");

        BadRequestException ex = assertThrows(BadRequestException.class, () -> claimService.submitClaim(100L, req, 1L));
        assertTrue(ex.getMessage().contains("cannot submit a claim on an item that you reported"));
    }

    @Test
    public void testUserCannotClaimNonOpenItem() {
        User alice = new User("Alice", "alice@campus.edu", "pass", "CS", null);
        alice.setId(1L);
        User bob = new User("Bob", "bob@campus.edu", "pass", "ME", null);
        bob.setId(2L);

        Item item = new Item();
        item.setId(101L);
        item.setTitle("Laptop");
        item.setReportedBy(bob);
        item.setStatus(ItemStatus.RESOLVED); // Already resolved

        when(userRepository.findById(1L)).thenReturn(Optional.of(alice));
        when(itemRepository.findById(101L)).thenReturn(Optional.of(item));

        ClaimCreateRequest req = new ClaimCreateRequest("Found it");

        BadRequestException ex = assertThrows(BadRequestException.class, () -> claimService.submitClaim(101L, req, 1L));
        assertTrue(ex.getMessage().contains("only be filed on OPEN items"));
    }

    @Test
    public void testUserCannotSubmitDuplicatePendingClaim() {
        User alice = new User("Alice", "alice@campus.edu", "pass", "CS", null);
        alice.setId(1L);
        User bob = new User("Bob", "bob@campus.edu", "pass", "ME", null);
        bob.setId(2L);

        Item item = new Item();
        item.setId(102L);
        item.setTitle("Umbrella");
        item.setReportedBy(bob);
        item.setStatus(ItemStatus.OPEN);

        when(userRepository.findById(1L)).thenReturn(Optional.of(alice));
        when(itemRepository.findById(102L)).thenReturn(Optional.of(item));
        when(claimRepository.existsByItemAndClaimantAndStatus(item, alice, ClaimStatus.PENDING)).thenReturn(true);

        ClaimCreateRequest req = new ClaimCreateRequest("My umbrella");

        BadRequestException ex = assertThrows(BadRequestException.class, () -> claimService.submitClaim(102L, req, 1L));
        assertTrue(ex.getMessage().contains("already have a pending claim"));
    }

    @Test
    public void testClaimApproval_ResolvesItemAndAutoRejectsOtherPendingClaims() {
        Admin admin = new Admin("Admin Desk", "admin@campus.edu", "pass");
        admin.setId(99L);

        User reporter = new User("Bob", "bob@campus.edu", "pass", "ME", null);
        reporter.setId(2L);

        User claimantA = new User("Alice", "alice@campus.edu", "pass", "CS", null);
        claimantA.setId(1L);

        User claimantB = new User("Charlie", "charlie@campus.edu", "pass", "EE", null);
        claimantB.setId(3L);

        Item item = new Item();
        item.setId(200L);
        item.setTitle("HydroFlask");
        item.setReportedBy(reporter);
        item.setStatus(ItemStatus.OPEN);

        Claim claimA = new Claim();
        claimA.setId(10L);
        claimA.setItem(item);
        claimA.setClaimant(claimantA);
        claimA.setStatus(ClaimStatus.PENDING);
        claimA.setMessage("Proof A");

        Claim claimB = new Claim();
        claimB.setId(11L);
        claimB.setItem(item);
        claimB.setClaimant(claimantB);
        claimB.setStatus(ClaimStatus.PENDING);
        claimB.setMessage("Proof B");

        when(claimRepository.findById(10L)).thenReturn(Optional.of(claimA));
        when(claimRepository.save(any(Claim.class))).thenAnswer(i -> i.getArgument(0));
        when(claimRepository.findByItemAndStatus(item, ClaimStatus.PENDING)).thenReturn(List.of(claimA, claimB));

        ClaimResponse response = claimService.approveClaim(10L, "Verified serial at desk", admin);

        assertEquals(ClaimStatus.APPROVED, response.getStatus());
        assertEquals(ItemStatus.RESOLVED, item.getStatus());
        assertEquals(ClaimStatus.REJECTED, claimB.getStatus()); // auto-rejected
        verify(itemRepository).save(item);
        verify(claimRepository).save(claimB);
    }

    @Test
    public void testCategoryInUse_CannotBeDeleted() {
        CategoryLocationService service = new CategoryLocationService(categoryRepository, locationRepository, itemRepository);

        Category cat = new Category("Electronics", "Gadgets");
        cat.setId(1L);

        when(categoryRepository.findById(1L)).thenReturn(Optional.of(cat));
        when(itemRepository.countByCategoryId(1L)).thenReturn(4L); // 4 items use it

        BadRequestException ex = assertThrows(BadRequestException.class, () -> service.deleteCategory(1L));
        assertTrue(ex.getMessage().contains("currently assigned to 4 items"));
    }

    @Test
    public void testSmartSuggestionScoring() {
        ItemService itemService = new ItemService(
                itemRepository, userRepository, categoryRepository, locationRepository,
                fileStorageService, notificationService, auditLogService
        );

        Category electronics = new Category("Electronics", null);
        electronics.setId(1L);

        Location library = new Location("Main Library", null);
        library.setId(1L);

        User alice = new User("Alice", "alice@campus.edu", "pass", "CS", null);
        alice.setId(1L);

        Item lostItem = new Item();
        lostItem.setId(1L);
        lostItem.setType(ItemType.LOST);
        lostItem.setTitle("Sony WH-1000XM4 Headphones");
        lostItem.setDescription("Silver over-ear wireless headphones in black case left at library desk");
        lostItem.setCategory(electronics);
        lostItem.setLocation(library);
        lostItem.setEventDate(LocalDate.now());
        lostItem.setStatus(ItemStatus.OPEN);
        lostItem.setReportedBy(alice);

        Item foundMatch = new Item();
        foundMatch.setId(2L);
        foundMatch.setType(ItemType.FOUND);
        foundMatch.setTitle("Wireless Sony Headphones in Case");
        foundMatch.setDescription("Silver over-ear headphones found on library reading desk");
        foundMatch.setCategory(electronics);
        foundMatch.setLocation(library); // same location (+20)
        foundMatch.setEventDate(LocalDate.now()); // same date (+30)
        foundMatch.setStatus(ItemStatus.OPEN);
        foundMatch.setReportedBy(new User("Bob", "bob@campus.edu", "pass", "ME", null));

        when(itemRepository.findById(1L)).thenReturn(Optional.of(lostItem));
        when(itemRepository.findByTypeAndStatusAndCategory(ItemType.FOUND, ItemStatus.OPEN, electronics))
                .thenReturn(List.of(foundMatch));

        List<ItemSuggestionResponse> suggestions = itemService.getSuggestions(1L);

        assertFalse(suggestions.isEmpty());
        ItemSuggestionResponse topSuggestion = suggestions.get(0);
        assertEquals(2L, topSuggestion.getItem().getId());
        // Base category (50) + location (20) + date <= 3 (30) + keywords (headphones, sony, wireless, case, desk)
        assertTrue(topSuggestion.getMatchScore() >= 100);
    }
}
