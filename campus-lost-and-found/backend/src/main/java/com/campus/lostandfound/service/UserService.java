package com.campus.lostandfound.service;

import com.campus.lostandfound.dto.user.AdminProfileResponse;
import com.campus.lostandfound.dto.user.AdminProfileUpdateRequest;
import com.campus.lostandfound.dto.user.ChangePasswordRequest;
import com.campus.lostandfound.dto.user.UserProfileResponse;
import com.campus.lostandfound.dto.user.UserProfileUpdateRequest;
import com.campus.lostandfound.entity.Admin;
import com.campus.lostandfound.entity.User;
import com.campus.lostandfound.exception.BadRequestException;
import com.campus.lostandfound.exception.ResourceNotFoundException;
import com.campus.lostandfound.repository.AdminRepository;
import com.campus.lostandfound.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;

    public UserService(UserRepository userRepository,
                       AdminRepository adminRepository,
                       PasswordEncoder passwordEncoder,
                       AuditLogService auditLogService) {
        this.userRepository = userRepository;
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditLogService = auditLogService;
    }

    public UserProfileResponse getUserProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return mapToUserProfileResponse(user);
    }

    @Transactional
    public UserProfileResponse updateUserProfile(Long userId, UserProfileUpdateRequest dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setFullName(dto.getFullName().trim());
        user.setDepartment(dto.getDepartment().trim());
        user.setPhone(dto.getPhone() != null ? dto.getPhone().trim() : null);

        user = userRepository.save(user);
        return mapToUserProfileResponse(user);
    }

    @Transactional
    public void changeUserPassword(Long userId, ChangePasswordRequest dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!passwordEncoder.matches(dto.getCurrentPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Current password does not match");
        }

        if (!dto.getNewPassword().equals(dto.getConfirmPassword())) {
            throw new BadRequestException("New password and confirmation do not match");
        }

        user.setPasswordHash(passwordEncoder.encode(dto.getNewPassword()));
        userRepository.save(user);
    }

    public Page<UserProfileResponse> adminSearchUsers(String query, Pageable pageable) {
        Page<User> users;
        if (StringUtils.hasText(query)) {
            users = userRepository.searchUsers(query.trim(), pageable);
        } else {
            users = userRepository.findAll(pageable);
        }
        return users.map(this::mapToUserProfileResponse);
    }

    @Transactional
    public UserProfileResponse adminBlockUser(Long userId, Admin admin) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setBlocked(true);
        user = userRepository.save(user);

        auditLogService.recordLog(
                admin,
                "USER_BLOCKED",
                "USER",
                user.getId(),
                "User " + user.getEmail() + " (" + user.getFullName() + ") suspended by admin"
        );

        return mapToUserProfileResponse(user);
    }

    @Transactional
    public UserProfileResponse adminUnblockUser(Long userId, Admin admin) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setBlocked(false);
        user = userRepository.save(user);

        auditLogService.recordLog(
                admin,
                "USER_UNBLOCKED",
                "USER",
                user.getId(),
                "User " + user.getEmail() + " (" + user.getFullName() + ") reinstated by admin"
        );

        return mapToUserProfileResponse(user);
    }

    public AdminProfileResponse getAdminProfile(Long adminId) {
        Admin admin = adminRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));
        return new AdminProfileResponse(admin.getId(), admin.getFullName(), admin.getEmail(), admin.getCreatedAt());
    }

    @Transactional
    public AdminProfileResponse updateAdminProfile(Long adminId, AdminProfileUpdateRequest dto) {
        Admin admin = adminRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));

        admin.setFullName(dto.getFullName().trim());
        admin = adminRepository.save(admin);
        return new AdminProfileResponse(admin.getId(), admin.getFullName(), admin.getEmail(), admin.getCreatedAt());
    }

    @Transactional
    public void changeAdminPassword(Long adminId, ChangePasswordRequest dto) {
        Admin admin = adminRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));

        if (!passwordEncoder.matches(dto.getCurrentPassword(), admin.getPasswordHash())) {
            throw new BadRequestException("Current password does not match");
        }

        if (!dto.getNewPassword().equals(dto.getConfirmPassword())) {
            throw new BadRequestException("New password and confirmation do not match");
        }

        admin.setPasswordHash(passwordEncoder.encode(dto.getNewPassword()));
        adminRepository.save(admin);

        auditLogService.recordLog(
                admin,
                "ADMIN_PASSWORD_CHANGED",
                "ADMIN",
                admin.getId(),
                "Admin changed their password"
        );
    }

    private UserProfileResponse mapToUserProfileResponse(User user) {
        return new UserProfileResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getDepartment(),
                user.getPhone(),
                user.isBlocked(),
                user.getCreatedAt()
        );
    }
}
