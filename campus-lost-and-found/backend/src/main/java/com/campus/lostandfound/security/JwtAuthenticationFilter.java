package com.campus.lostandfound.security;

import com.campus.lostandfound.entity.Admin;
import com.campus.lostandfound.entity.User;
import com.campus.lostandfound.repository.AdminRepository;
import com.campus.lostandfound.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Optional;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;
    private final AdminRepository adminRepository;

    public JwtAuthenticationFilter(JwtTokenProvider tokenProvider,
                                   UserRepository userRepository,
                                   AdminRepository adminRepository) {
        this.tokenProvider = tokenProvider;
        this.userRepository = userRepository;
        this.adminRepository = adminRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        try {
            String jwt = getJwtFromRequest(request);

            if (StringUtils.hasText(jwt) && tokenProvider.validateToken(jwt)) {
                String email = tokenProvider.getEmailFromToken(jwt);
                String role = tokenProvider.getRoleFromToken(jwt);
                String userType = tokenProvider.getUserTypeFromToken(jwt);

                UserPrincipal principal = null;

                if ("ADMIN".equals(userType) || "ROLE_ADMIN".equals(role)) {
                    Optional<Admin> adminOpt = adminRepository.findByEmail(email);
                    if (adminOpt.isPresent()) {
                        Admin admin = adminOpt.get();
                        principal = new UserPrincipal(
                                admin.getId(),
                                admin.getEmail(),
                                admin.getPasswordHash(),
                                admin.getFullName(),
                                "ROLE_ADMIN",
                                "ADMIN",
                                false
                        );
                    }
                } else {
                    Optional<User> userOpt = userRepository.findByEmail(email);
                    if (userOpt.isPresent()) {
                        User user = userOpt.get();
                        // If user is blocked, principal reflects locked status
                        principal = new UserPrincipal(
                                user.getId(),
                                user.getEmail(),
                                user.getPasswordHash(),
                                user.getFullName(),
                                "ROLE_USER",
                                "USER",
                                user.isBlocked()
                        );
                    }
                }

                if (principal != null && !principal.isBlocked()) {
                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            }
        } catch (Exception ex) {
            logger.error("Could not set user authentication in security context", ex);
        }

        filterChain.doFilter(request, response);
    }

    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
