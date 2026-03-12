# Multi-stage build for Spring Boot
FROM eclipse-temurin:17-jdk-alpine AS builder

WORKDIR /app
COPY build.gradle.kts settings.gradle.kts gradlew ./
COPY gradle gradle
RUN ./gradlew dependencies --no-daemon 2>/dev/null || true

COPY src src
    RUN chmod +x gradlew && ./gradlew bootJar --no-daemon -x test

# ──────────────────────────────────────────────
# Runtime image — smaller footprint
# ──────────────────────────────────────────────
FROM eclipse-temurin:17-jre-alpine

# Security: run as non-root
RUN addgroup -S nour && adduser -S nour -G nour
WORKDIR /app

COPY --from=builder /app/build/libs/*.jar app.jar

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1

USER nour
EXPOSE 8080

ENTRYPOINT ["java", \
    "-Djava.security.egd=file:/dev/./urandom", \
    "-XX:+UseContainerSupport", \
    "-XX:MaxRAMPercentage=75.0", \
    "-jar", "app.jar"]
