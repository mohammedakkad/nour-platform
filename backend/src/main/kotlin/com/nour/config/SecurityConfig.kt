package com.nour.config

import com.nour.security.JwtAuthenticationFilter
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.http.HttpMethod
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.security.web.SecurityFilterChain
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter
import org.springframework.web.cors.CorsConfiguration
import org.springframework.web.cors.CorsConfigurationSource
import org.springframework.web.cors.UrlBasedCorsConfigurationSource

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
class SecurityConfig(
    private val jwtAuthFilter: JwtAuthenticationFilter
) {

    @Bean
    fun securityFilterChain(http: HttpSecurity): SecurityFilterChain {
        http
            .csrf { it.disable() }
            .cors { it.configurationSource(corsConfigurationSource()) }
            .sessionManagement { it.sessionCreationPolicy(SessionCreationPolicy.STATELESS) }
            .authorizeHttpRequests { auth ->
                auth

                    // ✅ أضف هذا السطر أولاً
                    .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                    // Public endpoints
                    .requestMatchers(HttpMethod.POST, "/api/v1/auth/login").permitAll()
                    .requestMatchers(HttpMethod.POST, "/api/v1/auth/register").permitAll()
                    // Public endpoints
                    .requestMatchers(HttpMethod.POST, "/api/v1/auth/login").permitAll()
                    .requestMatchers(HttpMethod.POST, "/api/v1/auth/register").permitAll()
                    .requestMatchers(HttpMethod.POST, "/api/v1/auth/refresh").permitAll()
                    // Swagger
                    .requestMatchers("/swagger-ui/**", "/api-docs/**").permitAll()
                    // Actuator health
                    .requestMatchers("/actuator/health").permitAll()

                    // Role-based access
                    // Super Admin — full access
                    .requestMatchers("/api/v1/admin/**").hasAnyRole("SUPER_ADMIN", "SCHOOL_ADMIN")
                    .requestMatchers("/api/v1/super/**").hasRole("SUPER_ADMIN")

                    // Content upload — teachers and above
                    .requestMatchers(HttpMethod.POST, "/api/v1/content/**")
                        .hasAnyRole("TEACHER", "SCHOOL_ADMIN", "SUPER_ADMIN")

                    // Content approval — admin and above
                    .requestMatchers(HttpMethod.PATCH, "/api/v1/content/*/status")
                        .hasAnyRole("SCHOOL_ADMIN", "SUPER_ADMIN")

                    // Exams — teachers create, students submit
                    .requestMatchers(HttpMethod.POST, "/api/v1/exams")
                        .hasAnyRole("TEACHER", "SCHOOL_ADMIN", "SUPER_ADMIN")
                    .requestMatchers(HttpMethod.POST, "/api/v1/exams/*/submit")
                        .hasRole("STUDENT")

                    // Analytics — donors and admin
                    .requestMatchers("/api/v1/analytics/**")
                        .hasAnyRole("DONOR", "SCHOOL_ADMIN", "SUPER_ADMIN")

                    // All other requests — must be authenticated
                    .anyRequest().authenticated()
            }
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter::class.java)

        return http.build()
    }

    @Bean
    fun passwordEncoder(): PasswordEncoder = BCryptPasswordEncoder(12)

    @Bean
    fun corsConfigurationSource(): CorsConfigurationSource {
        val configuration = CorsConfiguration().apply {
            allowedOriginPatterns = listOf("*")
            allowedMethods = listOf("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
            allowedHeaders = listOf("*")
            allowCredentials = false
            maxAge = 3600
        }
        return UrlBasedCorsConfigurationSource().apply {
            registerCorsConfiguration("/**", configuration)

        }
    }
}
