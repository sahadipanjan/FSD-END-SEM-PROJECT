package com.campus.lostandfound;

import com.campus.lostandfound.dto.auth.AdminRegisterRequest;
import com.campus.lostandfound.dto.auth.AuthResponse;
import com.campus.lostandfound.dto.auth.LoginRequest;
import com.campus.lostandfound.dto.auth.UserRegisterRequest;
import com.campus.lostandfound.entity.Admin;
import com.campus.lostandfound.entity.User;
import com.campus.lostandfound.exception.BadRequestException;
import com.campus.lostandfound.exception.ForbiddenException;
import com.campus.lostandfound.exception.UnauthorizedException;
import com.campus.lostandfound.repository.AdminRepository;
import com.campus.lostandfound.repository.UserRepository;
import com.campus.lostandfound.security.JwtTokenProvider;
import com.campus.lostandfound.service.AuditLogService;
import com.campus.lostandfound.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private AdminRepository adminRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider tokenProvider;

    @Mock
    private AuditLogService auditLogService;

    private AuthService authService;

    @BeforeEach
    public void setup() {
        authService = new AuthService(userRepository, adminRepository, passwordEncoder, tokenProvider, auditLogService);
        ReflectionTestUtils.setField(authService, "adminInviteCode", "CAMPUS_ADMIN_2026");
        ReflectionTestUtils.setField(authService, "allowedEmailDomain", "");
    }

    @Test
    public void testUserRegister_Success() {
        UserRegisterRequest req = new UserRegisterRequest();
        req.setFullName("John Doe");
        req.setEmail("john@campus.edu");
        req.setPassword("Password123!");
        req.setConfirmPassword("Password123!");
        req.setDepartment("Computer Science");
        req.setPhone("1234567890");

        when(userRepository.existsByEmail("john@campus.edu")).thenReturn(false);
        when(passwordEncoder.encode("Password123!")).thenReturn("encoded_pass");

        User savedUser = new User("John Doe", "john@campus.edu", "encoded_pass", "Computer Science", "1234567890");
        savedUser.setId(10L);
        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(tokenProvider.generateToken(eq(10L), eq("john@campus.edu"), eq("John Doe"), eq("ROLE_USER"), eq("USER")))
                .thenReturn("mock_jwt_token");

        AuthResponse resp = authService.registerUser(req);

        assertNotNull(resp);
        assertEquals("ROLE_USER", resp.getRole());
        assertEquals("john@campus.edu", resp.getEmail());
        assertEquals("mock_jwt_token", resp.getToken());
    }

    @Test
    public void testUserRegister_PasswordMismatch_ThrowsBadRequest() {
        UserRegisterRequest req = new UserRegisterRequest();
        req.setEmail("test@campus.edu");
        req.setPassword("Password123!");
        req.setConfirmPassword("Different123!");

        assertThrows(BadRequestException.class, () -> authService.registerUser(req));
    }

    @Test
    public void testUserRegister_DuplicateEmail_ThrowsBadRequest() {
        UserRegisterRequest req = new UserRegisterRequest();
        req.setFullName("Jane Doe");
        req.setEmail("existing@campus.edu");
        req.setPassword("Password123!");
        req.setConfirmPassword("Password123!");
        req.setDepartment("Math");

        when(userRepository.existsByEmail("existing@campus.edu")).thenReturn(true);

        assertThrows(BadRequestException.class, () -> authService.registerUser(req));
    }

    @Test
    public void testUserLogin_Success() {
        LoginRequest req = new LoginRequest("user@campus.edu", "Password123!");
        User user = new User("Test User", "user@campus.edu", "hashed_pass", "IT", null);
        user.setId(5L);

        when(userRepository.findByEmail("user@campus.edu")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("Password123!", "hashed_pass")).thenReturn(true);
        when(tokenProvider.generateToken(5L, "user@campus.edu", "Test User", "ROLE_USER", "USER"))
                .thenReturn("valid_jwt");

        AuthResponse resp = authService.loginUser(req);

        assertEquals("valid_jwt", resp.getToken());
        assertEquals("ROLE_USER", resp.getRole());
    }

    @Test
    public void testUserLogin_BlockedUser_ThrowsForbidden() {
        LoginRequest req = new LoginRequest("blocked@campus.edu", "Password123!");
        User user = new User("Blocked User", "blocked@campus.edu", "hashed_pass", "IT", null);
        user.setId(6L);
        user.setBlocked(true);

        when(userRepository.findByEmail("blocked@campus.edu")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("Password123!", "hashed_pass")).thenReturn(true);

        assertThrows(ForbiddenException.class, () -> authService.loginUser(req));
    }

    @Test
    public void testUserLogin_WrongPassword_ThrowsUnauthorized() {
        LoginRequest req = new LoginRequest("user@campus.edu", "WrongPass");
        User user = new User("Test User", "user@campus.edu", "hashed_pass", "IT", null);

        when(userRepository.findByEmail("user@campus.edu")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("WrongPass", "hashed_pass")).thenReturn(false);

        assertThrows(UnauthorizedException.class, () -> authService.loginUser(req));
    }

    @Test
    public void testAdminRegister_WrongInviteCode_ThrowsBadRequest() {
        AdminRegisterRequest req = new AdminRegisterRequest();
        req.setFullName("Admin Name");
        req.setEmail("admin@campus.edu");
        req.setPassword("AdminPass123!");
        req.setConfirmPassword("AdminPass123!");
        req.setInviteCode("WRONG_CODE");

        assertThrows(BadRequestException.class, () -> authService.registerAdmin(req));
    }

    @Test
    public void testAdminRegister_CorrectInviteCode_Success() {
        AdminRegisterRequest req = new AdminRegisterRequest();
        req.setFullName("Admin Officer");
        req.setEmail("newadmin@campus.edu");
        req.setPassword("AdminPass123!");
        req.setConfirmPassword("AdminPass123!");
        req.setInviteCode("CAMPUS_ADMIN_2026");

        when(adminRepository.existsByEmail("newadmin@campus.edu")).thenReturn(false);
        when(passwordEncoder.encode("AdminPass123!")).thenReturn("encoded_admin_pass");

        Admin admin = new Admin("Admin Officer", "newadmin@campus.edu", "encoded_admin_pass");
        admin.setId(2L);
        when(adminRepository.save(any(Admin.class))).thenReturn(admin);
        when(tokenProvider.generateToken(2L, "newadmin@campus.edu", "Admin Officer", "ROLE_ADMIN", "ADMIN"))
                .thenReturn("admin_jwt");

        AuthResponse resp = authService.registerAdmin(req);

        assertEquals("ROLE_ADMIN", resp.getRole());
        assertEquals("newadmin@campus.edu", resp.getEmail());
        assertEquals("admin_jwt", resp.getToken());
    }
}
