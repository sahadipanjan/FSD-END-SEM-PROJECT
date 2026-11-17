package com.campus.lostandfound.service;

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
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final AuditLogService auditLogService;

    @Value("${app.admin.invite-code:CAMPUS_ADMIN_2026}")
    private String adminInviteCode;

    @Value("${app.auth.allowed-email-domain:}")
    private String allowedEmailDomain;

    public AuthService(UserRepository userRepository,
                       AdminRepository adminRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider tokenProvider,
                       AuditLogService auditLogService) {
        this.userRepository = userRepository;
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
        this.auditLogService = auditLogService;
    }

    @Transactional
    public AuthResponse registerUser(UserRegisterRequest request) {
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Password and confirm password do not match");
        }

        String email = request.getEmail().trim().toLowerCase();

        if (StringUtils.hasText(allowedEmailDomain)) {
            String domain = allowedEmailDomain.trim().toLowerCase();
            if (!email.endsWith("@" + domain) && !email.endsWith("." + domain)) {
                throw new BadRequestException("Registration is restricted to institutional email addresses (" + domain + ")");
            }
        }

        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("An account with this email address already exists");
        }

        User user = new User(
                request.getFullName().trim(),
                email,
                passwordEncoder.encode(request.getPassword()),
                request.getDepartment().trim(),
                request.getPhone() != null ? request.getPhone().trim() : null
        );

        user = userRepository.save(user);

        String token = tokenProvider.generateToken(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                "ROLE_USER",
                "USER"
        );

        return new AuthResponse(
                token,
                "ROLE_USER",
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getDepartment(),
                "USER"
        );
    }

    public AuthResponse loginUser(LoginRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        if (user.isBlocked()) {
            throw new ForbiddenException("Your account has been suspended by administration. Please contact the campus lost and found desk.");
        }

        String token = tokenProvider.generateToken(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                "ROLE_USER",
                "USER"
        );

        return new AuthResponse(
                token,
                "ROLE_USER",
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getDepartment(),
                "USER"
        );
    }

    @Transactional
    public AuthResponse registerAdmin(AdminRegisterRequest request) {
        if (!adminInviteCode.equals(request.getInviteCode().trim())) {
            throw new BadRequestException("Invalid admin invite code. Administrator registration rejected.");
        }

        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Password and confirm password do not match");
        }

        String email = request.getEmail().trim().toLowerCase();
        if (adminRepository.existsByEmail(email)) {
            throw new BadRequestException("An administrator with this email address already exists");
        }

        Admin admin = new Admin(
                request.getFullName().trim(),
                email,
                passwordEncoder.encode(request.getPassword())
        );

        admin = adminRepository.save(admin);

        auditLogService.recordLog(
                admin,
                "ADMIN_REGISTERED",
                "ADMIN",
                admin.getId(),
                "New administrator account created for " + admin.getEmail()
        );

        String token = tokenProvider.generateToken(
                admin.getId(),
                admin.getEmail(),
                admin.getFullName(),
                "ROLE_ADMIN",
                "ADMIN"
        );

        return new AuthResponse(
                token,
                "ROLE_ADMIN",
                admin.getId(),
                admin.getEmail(),
                admin.getFullName(),
                "Administration",
                "ADMIN"
        );
    }

    public AuthResponse loginAdmin(LoginRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        Admin admin = adminRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), admin.getPasswordHash())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        String token = tokenProvider.generateToken(
                admin.getId(),
                admin.getEmail(),
                admin.getFullName(),
                "ROLE_ADMIN",
                "ADMIN"
        );

        return new AuthResponse(
                token,
                "ROLE_ADMIN",
                admin.getId(),
                admin.getEmail(),
                admin.getFullName(),
                "Administration",
                "ADMIN"
        );
    }
}
