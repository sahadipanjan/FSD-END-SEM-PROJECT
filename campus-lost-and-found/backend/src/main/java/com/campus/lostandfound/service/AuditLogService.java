package com.campus.lostandfound.service;

import com.campus.lostandfound.entity.Admin;
import com.campus.lostandfound.entity.AuditLog;
import com.campus.lostandfound.repository.AuditLogRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public AuditLogService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional
    public void recordLog(Admin admin, String action, String targetType, Long targetId, String details) {
        AuditLog log = new AuditLog(admin, admin.getEmail(), action, targetType, targetId, details);
        auditLogRepository.save(log);
    }

    public Page<AuditLog> getAuditLogs(Pageable pageable) {
        return auditLogRepository.findAllByOrderByCreatedAtDesc(pageable);
    }
}
