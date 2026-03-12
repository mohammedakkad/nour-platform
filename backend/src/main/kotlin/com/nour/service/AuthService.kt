package com.nour.service

import com.nour.dto.*
import com.nour.model.User
import com.nour.model.UserRole
import com.nour.repository.UserRepository
import com.nour.security.JwtTokenProvider
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service

@Service
class AuthService(
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder,
    private val jwtTokenProvider: JwtTokenProvider
) {
    fun login(request: LoginRequest): AuthResponse {
        val user = userRepository.findByUsername(request.username)
            ?: throw RuntimeException("اسم المستخدم أو كلمة المرور غير صحيحة")
        if (!passwordEncoder.matches(request.password, user.passwordHash))
            throw RuntimeException("اسم المستخدم أو كلمة المرور غير صحيحة")
        if (!user.isActive)
            throw RuntimeException("الحساب غير مفعّل")
        return buildAuthResponse(user)
    }

    fun register(request: RegisterRequest): AuthResponse {
        if (userRepository.existsByUsername(request.username))
            throw RuntimeException("اسم المستخدم مستخدم مسبقاً")
        val user = User(
            username = request.username,
            passwordHash = passwordEncoder.encode(request.password),
            fullNameAr = request.fullNameAr,
            role = UserRole.valueOf(request.role)
        )
        val saved = userRepository.save(user)
        return buildAuthResponse(saved)
    }

    fun refreshToken(request: RefreshTokenRequest): AuthResponse {
        if (!jwtTokenProvider.validateToken(request.refreshToken))
            throw RuntimeException("Refresh token غير صالح")
        val userId = jwtTokenProvider.getUserIdFromToken(request.refreshToken)
        val user = userRepository.findById(java.util.UUID.fromString(userId))
            .orElseThrow { RuntimeException("المستخدم غير موجود") }
        return buildAuthResponse(user)
    }

    fun logout() { /* Token is stateless — client deletes it */ }

    private fun buildAuthResponse(user: User): AuthResponse {
        val accessToken  = jwtTokenProvider.generateToken(user.id.toString(), user.username, user.role)
        val refreshToken = jwtTokenProvider.generateRefreshToken(user.id.toString())
        return AuthResponse(
            accessToken  = accessToken,
            refreshToken = refreshToken,
            expiresIn    = 86400,
            user = UserResponse(
                id         = user.id.toString(),
                username   = user.username,
                fullNameAr = user.fullNameAr,
                role       = user.role.name,
                schoolId   = user.school?.id?.toString(),
                classId    = user.schoolClass?.id?.toString(),
                isActive   = user.isActive
            )
        )
    }
}
