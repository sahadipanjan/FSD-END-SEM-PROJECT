package com.campus.lostandfound;

import com.campus.lostandfound.repository.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("dev-h2")
public class ApplicationIntegrationTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private LocationRepository locationRepository;

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private ClaimRepository claimRepository;

    @Test
    public void testContextLoadsAndSeedingSucceeds() {
        assertTrue(categoryRepository.count() >= 8, "Categories should be seeded");
        assertTrue(locationRepository.count() >= 10, "Locations should be seeded");
        assertTrue(adminRepository.existsByEmail("admin@campus.edu"), "Admin should be seeded");
        assertTrue(userRepository.existsByEmail("alice@campus.edu"), "Alice should be seeded");
        assertTrue(userRepository.existsByEmail("bob@campus.edu"), "Bob should be seeded");
        assertTrue(userRepository.existsByEmail("charlie@campus.edu"), "Charlie should be seeded");
        assertTrue(itemRepository.count() >= 12, "Items should be seeded");
        assertTrue(claimRepository.count() >= 4, "Claims should be seeded");
    }
}
