package com.campus.lostandfound.config;

import com.campus.lostandfound.entity.*;
import com.campus.lostandfound.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseSeeder.class);

    private final UserRepository userRepository;
    private final AdminRepository adminRepository;
    private final CategoryRepository categoryRepository;
    private final LocationRepository locationRepository;
    private final ItemRepository itemRepository;
    private final ClaimRepository claimRepository;
    private final NotificationRepository notificationRepository;
    private final AuditLogRepository auditLogRepository;
    private final PasswordEncoder passwordEncoder;

    public DatabaseSeeder(UserRepository userRepository,
                          AdminRepository adminRepository,
                          CategoryRepository categoryRepository,
                          LocationRepository locationRepository,
                          ItemRepository itemRepository,
                          ClaimRepository claimRepository,
                          NotificationRepository notificationRepository,
                          AuditLogRepository auditLogRepository,
                          PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.adminRepository = adminRepository;
        this.categoryRepository = categoryRepository;
        this.locationRepository = locationRepository;
        this.itemRepository = itemRepository;
        this.claimRepository = claimRepository;
        this.notificationRepository = notificationRepository;
        this.auditLogRepository = auditLogRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        seedCategories();
        seedLocations();
        Admin admin = seedAdmin();
        List<User> users = seedUsers();
        seedItemsAndClaims(admin, users);
    }

    private void seedCategories() {
        if (categoryRepository.count() == 0) {
            logger.info("Seeding initial categories...");
            categoryRepository.saveAll(List.of(
                    new Category("Electronics", "Laptops, mobile phones, chargers, headphones, calculators, USB drives"),
                    new Category("ID & Cards", "Student ID cards, library cards, national IDs, credit/debit cards"),
                    new Category("Wallets & Purses", "Leather wallets, coin pouches, cardholders, money clips"),
                    new Category("Bags & Backpacks", "Backpacks, shoulder bags, duffel bags, laptop sleeves"),
                    new Category("Keys", "Room keys, bike/car keys, keychains with access tags"),
                    new Category("Books & Stationery", "Textbooks, notebooks, pencil pouches, calculators, lab manuals"),
                    new Category("Clothing & Apparel", "Jackets, hoodies, caps, umbrellas, scarves, lab coats"),
                    new Category("Others", "Water bottles, spectacles, sports gear, musical instruments")
            ));
        }
    }

    private void seedLocations() {
        if (locationRepository.count() == 0) {
            logger.info("Seeding initial campus locations...");
            locationRepository.saveAll(List.of(
                    new Location("Main Library", "Central university library reading halls and circulation desk"),
                    new Location("Main Gate", "Primary campus security gate and visitor entry checkpoint"),
                    new Location("Student Canteen", "Central cafeteria dining hall and juice corner"),
                    new Location("Hostel Block A", "Residential hostel lobby, mess, and common rooms"),
                    new Location("Admin Block", "Registrar office, finance counter, and dean offices"),
                    new Location("Sports Complex", "Indoor badminton courts, gym, and outdoor stadium track"),
                    new Location("CS Department", "Turing Hall, lab 301, and faculty lounge on 3rd floor"),
                    new Location("Auditorium", "Main university auditorium and seminar hall lobby"),
                    new Location("West Parking Lot", "Two-wheeler and four-wheeler vehicle parking area"),
                    new Location("Campus Bus Stop", "Shuttle transit pick-up and drop-off point near north gate")
            ));
        }
    }

    private Admin seedAdmin() {
        return adminRepository.findByEmail("admin@campus.edu").orElseGet(() -> {
            logger.info("Seeding default administrator (admin@campus.edu)...");
            Admin admin = new Admin(
                    "Campus Desk Admin",
                    "admin@campus.edu",
                    passwordEncoder.encode("AdminPassword123!")
            );
            return adminRepository.save(admin);
        });
    }

    private List<User> seedUsers() {
        User alice = userRepository.findByEmail("alice@campus.edu").orElseGet(() -> {
            logger.info("Seeding demo user Alice (alice@campus.edu)...");
            return userRepository.save(new User(
                    "Alice Smith",
                    "alice@campus.edu",
                    passwordEncoder.encode("UserPassword123!"),
                    "Computer Science",
                    "+1-555-0101"
            ));
        });

        User bob = userRepository.findByEmail("bob@campus.edu").orElseGet(() -> {
            logger.info("Seeding demo user Bob (bob@campus.edu)...");
            return userRepository.save(new User(
                    "Bob Johnson",
                    "bob@campus.edu",
                    passwordEncoder.encode("UserPassword123!"),
                    "Mechanical Engineering",
                    "+1-555-0102"
            ));
        });

        User charlie = userRepository.findByEmail("charlie@campus.edu").orElseGet(() -> {
            logger.info("Seeding demo user Charlie (charlie@campus.edu)...");
            return userRepository.save(new User(
                    "Charlie Davis",
                    "charlie@campus.edu",
                    passwordEncoder.encode("UserPassword123!"),
                    "Electrical Engineering",
                    "+1-555-0103"
            ));
        });

        return List.of(alice, bob, charlie);
    }

    private void seedItemsAndClaims(Admin admin, List<User> users) {
        if (itemRepository.count() > 0) {
            return;
        }

        logger.info("Seeding realistic sample items and claims...");

        User alice = users.get(0);
        User bob = users.get(1);
        User charlie = users.get(2);

        Category electronics = categoryRepository.findByNameIgnoreCase("Electronics").orElse(null);
        Category books = categoryRepository.findByNameIgnoreCase("Books & Stationery").orElse(null);
        Category wallets = categoryRepository.findByNameIgnoreCase("Wallets & Purses").orElse(null);
        Category keys = categoryRepository.findByNameIgnoreCase("Keys").orElse(null);
        Category others = categoryRepository.findByNameIgnoreCase("Others").orElse(null);

        Location library = locationRepository.findByNameIgnoreCase("Main Library").orElse(null);
        Location canteen = locationRepository.findByNameIgnoreCase("Student Canteen").orElse(null);
        Location csDept = locationRepository.findByNameIgnoreCase("CS Department").orElse(null);
        Location hostel = locationRepository.findByNameIgnoreCase("Hostel Block A").orElse(null);
        Location auditorium = locationRepository.findByNameIgnoreCase("Auditorium").orElse(null);

        // Item 1: LOST - OPEN (Alice)
        Item item1 = new Item();
        item1.setType(ItemType.LOST);
        item1.setTitle("Blue HydroFlask Water Bottle");
        item1.setDescription("Matte blue HydroFlask 32oz with a NASA sticker and dent on bottom rim. Left on table 4.");
        item1.setCategory(others);
        item1.setLocation(library);
        item1.setEventDate(LocalDate.now().minusDays(5));
        item1.setContactPreference("Campus Desk");
        item1.setStatus(ItemStatus.OPEN);
        item1.setReportedBy(alice);
        item1 = itemRepository.save(item1);

        // Item 2: FOUND - OPEN (Bob) -> matches Item 1
        Item item2 = new Item();
        item2.setType(ItemType.FOUND);
        item2.setTitle("Navy Blue Insulated Water Flask");
        item2.setDescription("Found a blue insulated metal water flask with science stickers near the study cubicles.");
        item2.setCategory(others);
        item2.setLocation(library);
        item2.setEventDate(LocalDate.now().minusDays(4));
        item2.setContactPreference("Campus Desk");
        item2.setStatus(ItemStatus.OPEN);
        item2.setReportedBy(bob);
        item2 = itemRepository.save(item2);

        // Item 3: LOST - OPEN (Charlie)
        Item item3 = new Item();
        item3.setType(ItemType.LOST);
        item3.setTitle("Lenovo ThinkPad Laptop Charger");
        item3.setDescription("65W USB-C black charger with velcro cable tie. Forgotten during CS301 lab session.");
        item3.setCategory(electronics);
        item3.setLocation(csDept);
        item3.setEventDate(LocalDate.now().minusDays(3));
        item3.setContactPreference("Email");
        item3.setStatus(ItemStatus.OPEN);
        item3.setReportedBy(charlie);
        item3 = itemRepository.save(item3);

        // Item 4: FOUND - OPEN (Alice) -> matches Item 3
        Item item4 = new Item();
        item4.setType(ItemType.FOUND);
        item4.setTitle("Black 65W USB-C Power Adapter");
        item4.setDescription("Found Lenovo 65W power brick under workstation desk 12 in CS Turing Lab.");
        item4.setCategory(electronics);
        item4.setLocation(csDept);
        item4.setEventDate(LocalDate.now().minusDays(3));
        item4.setContactPreference("Campus Desk");
        item4.setStatus(ItemStatus.OPEN);
        item4.setReportedBy(alice);
        item4 = itemRepository.save(item4);

        // Item 5: LOST - RESOLVED (Alice)
        Item item5 = new Item();
        item5.setType(ItemType.LOST);
        item5.setTitle("Brown Leather Fossil Wallet");
        item5.setDescription("Contains student ID card for Alice Smith and transit card. Lost near canteen.");
        item5.setCategory(wallets);
        item5.setLocation(canteen);
        item5.setEventDate(LocalDate.now().minusDays(9));
        item5.setContactPreference("Campus Desk");
        item5.setStatus(ItemStatus.RESOLVED);
        item5.setReportedBy(alice);
        item5 = itemRepository.save(item5);

        // Item 6: FOUND - RESOLVED (Bob)
        Item item6 = new Item();
        item6.setType(ItemType.FOUND);
        item6.setTitle("Fossil Men Leather Wallet");
        item6.setDescription("Found near the coffee counter in student cafeteria with several cards inside.");
        item6.setCategory(wallets);
        item6.setLocation(canteen);
        item6.setEventDate(LocalDate.now().minusDays(9));
        item6.setContactPreference("Campus Desk");
        item6.setStatus(ItemStatus.RESOLVED);
        item6.setReportedBy(bob);
        item6 = itemRepository.save(item6);

        // Item 7: LOST - OPEN (Bob)
        Item item7 = new Item();
        item7.setType(ItemType.LOST);
        item7.setTitle("Sony WH-1000XM4 Noise Cancelling Headphones");
        item7.setDescription("Silver/grey Sony over-ear headphones inside a black zippered hard travel case.");
        item7.setCategory(electronics);
        item7.setLocation(library);
        item7.setEventDate(LocalDate.now().minusDays(2));
        item7.setContactPreference("Phone");
        item7.setStatus(ItemStatus.OPEN);
        item7.setReportedBy(bob);
        item7 = itemRepository.save(item7);

        // Item 8: FOUND - OPEN (Charlie)
        Item item8 = new Item();
        item8.setType(ItemType.FOUND);
        item8.setTitle("Over-Ear Wireless Headphones in Case");
        item8.setDescription("Grey wireless headphones found on reading desk in 2nd floor silent section.");
        item8.setCategory(electronics);
        item8.setLocation(library);
        item8.setEventDate(LocalDate.now().minusDays(1));
        item8.setContactPreference("Campus Desk");
        item8.setStatus(ItemStatus.OPEN);
        item8.setReportedBy(charlie);
        item8 = itemRepository.save(item8);

        // Item 9: LOST - OPEN (Charlie)
        Item item9 = new Item();
        item9.setType(ItemType.LOST);
        item9.setTitle("Set of 3 Dorm Keys on Red Lanyard");
        item9.setDescription("Room 204 keys with a red university athletics lanyard and bottle opener keychain.");
        item9.setCategory(keys);
        item9.setLocation(hostel);
        item9.setEventDate(LocalDate.now().minusDays(1));
        item9.setContactPreference("Email");
        item9.setStatus(ItemStatus.OPEN);
        item9.setReportedBy(charlie);
        item9 = itemRepository.save(item9);

        // Item 10: FOUND - OPEN (Alice)
        Item item10 = new Item();
        item10.setType(ItemType.FOUND);
        item10.setTitle("Keys with Red Strap");
        item10.setDescription("Found set of brass keys with red branded strap near hostel mess entrance.");
        item10.setCategory(keys);
        item10.setLocation(hostel);
        item10.setEventDate(LocalDate.now().minusDays(1));
        item10.setContactPreference("Campus Desk");
        item10.setStatus(ItemStatus.OPEN);
        item10.setReportedBy(alice);
        item10 = itemRepository.save(item10);

        // Item 11: LOST - REMOVED (Bob)
        Item item11 = new Item();
        item11.setType(ItemType.LOST);
        item11.setTitle("Spam Test Report - Broken Pencil");
        item11.setDescription("Duplicate entry submitted erroneously.");
        item11.setCategory(books);
        item11.setLocation(canteen);
        item11.setEventDate(LocalDate.now().minusDays(7));
        item11.setContactPreference("Email");
        item11.setStatus(ItemStatus.REMOVED);
        item11.setRemovalReason("Duplicate entry flagged and removed by desk staff.");
        item11.setReportedBy(bob);
        item11 = itemRepository.save(item11);

        // Item 12: FOUND - OPEN (Bob)
        Item item12 = new Item();
        item12.setType(ItemType.FOUND);
        item12.setTitle("Calculus Early Transcendentals Textbook 9th Ed");
        item12.setDescription("Hardcover Stewart Calculus book left on bench near auditorium exit.");
        item12.setCategory(books);
        item12.setLocation(auditorium);
        item12.setEventDate(LocalDate.now().minusDays(1));
        item12.setContactPreference("Campus Desk");
        item12.setStatus(ItemStatus.OPEN);
        item12.setReportedBy(bob);
        item12 = itemRepository.save(item12);

        // Seed Claims
        // Claim 1: Approved claim on item 6 by Alice
        Claim claim1 = new Claim();
        claim1.setItem(item6);
        claim1.setClaimant(alice);
        claim1.setMessage("This is my wallet! It contains my Alice Smith CS department student ID and green transit card.");
        claim1.setStatus(ClaimStatus.APPROVED);
        claim1.setAdmin(admin);
        claim1.setAdminRemark("Verified claimant student ID in person at desk. Handed over.");
        claimRepository.save(claim1);

        // Claim 2: Pending claim on item 2 by Alice
        Claim claim2 = new Claim();
        claim2.setItem(item2);
        claim2.setClaimant(alice);
        claim2.setMessage("I lost my blue HydroFlask at the library yesterday. It has a NASA circle sticker on the side.");
        claim2.setStatus(ClaimStatus.PENDING);
        claimRepository.save(claim2);

        // Claim 3: Pending claim on item 4 by Charlie
        Claim claim3 = new Claim();
        claim3.setItem(item4);
        claim3.setClaimant(charlie);
        claim3.setMessage("This matches my Lenovo charger left at lab 301. It has my initials CD written in silver marker.");
        claim3.setStatus(ClaimStatus.PENDING);
        claimRepository.save(claim3);

        // Claim 4: Rejected claim on item 8 by Alice
        Claim claim4 = new Claim();
        claim4.setItem(item8);
        claim4.setClaimant(alice);
        claim4.setMessage("I think these might be my headphones.");
        claim4.setStatus(ClaimStatus.REJECTED);
        claim4.setAdmin(admin);
        claim4.setAdminRemark("Claimant could not provide serial number or matching color details upon desk verification.");
        claimRepository.save(claim4);

        // Seed Notifications
        notificationRepository.saveAll(List.of(
                new Notification(alice, "Claim Approved!", "Your claim for item \"Fossil Men Leather Wallet\" has been approved by the Campus Desk Admin. Please visit the admin desk to collect it."),
                new Notification(alice, "Claim Decision Update", "Your claim for item \"Over-Ear Wireless Headphones in Case\" was reviewed and rejected. Remark: Claimant could not provide serial number or matching color details upon desk verification."),
                new Notification(bob, "New Claim Submitted", "Alice Smith submitted a claim for your found item \"Navy Blue Insulated Water Flask\". The desk is mediating."),
                new Notification(alice, "New Claim Submitted", "Charlie Davis submitted a claim for your found item \"Black 65W USB-C Power Adapter\". The desk is mediating.")
        ));

        // Seed Audit Logs
        auditLogRepository.saveAll(List.of(
                new AuditLog(admin, admin.getEmail(), "CLAIM_APPROVED", "CLAIM", claim1.getId(), "Approved claim #1 for item #6 (Fossil Men Leather Wallet). Verified student ID in person."),
                new AuditLog(admin, admin.getEmail(), "ITEM_RESOLVED", "ITEM", item6.getId(), "Item #6 marked RESOLVED following approved claim #1."),
                new AuditLog(admin, admin.getEmail(), "CLAIM_REJECTED", "CLAIM", claim4.getId(), "Rejected claim #4 for item #8. Reason: Failed identity/detail check."),
                new AuditLog(admin, admin.getEmail(), "ITEM_REMOVED", "ITEM", item11.getId(), "Soft deleted item #11. Reason: Duplicate entry flagged and removed by desk staff.")
        ));

        logger.info("Database seeding complete.");
    }
}
