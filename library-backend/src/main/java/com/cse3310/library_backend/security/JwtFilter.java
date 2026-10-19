package com.cse3310.library_backend.security;

import java.io.IOException;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component 
public class JwtFilter extends OncePerRequestFilter{
    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;

    public JwtFilter(JwtService jwtService, CustomUserDetailsService userDetailsService)
    {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request)
    {
        return request.getServletPath().startsWith("/auth/");
    }

    @Override
    public void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        //check if access token exists, if not then
        //continue filtering unauthenticated
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        //if jwt is malformed or fails verification check, it will throw
        //and catch an exception and continue filtering unauthenticated
        String token = authHeader.substring(7);
        String username = null;
        try {
            username = jwtService.getClaims(token).getSubject();
        } catch (Exception e) {
            filterChain.doFilter(request, response);
            return;
        }

        //username exists but no authentication set yet
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null)
        {
            CustomUserDetails userDetails = userDetailsService.loadUserByUsername(username);

            if (jwtService.isTokenValid(token, userDetails))
            {
                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }
        filterChain.doFilter(request, response);
    }
}
