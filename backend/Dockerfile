# ── Stage 1: Build ──────────────────────────────
FROM eclipse-temurin:17-jdk-alpine AS builder

# Install gradle
RUN apk add --no-cache wget unzip && \
    wget -q https://services.gradle.org/distributions/gradle-8.8-bin.zip -O /tmp/gradle.zip && \
    unzip -q /tmp/gradle.zip -d /opt && \
    rm /tmp/gradle.zip
ENV PATH="/opt/gradle-8.8/bin:$PATH"

WORKDIR /app

COPY build.gradle.kts settings.gradle.kts ./
COPY gradle gradle

# Download dependencies first (cache layer)
RUN gradle dependencies --no-daemon 2>/dev/null || true

COPY src src
RUN gradle bootJar --no-daemon -x test

# ── Stage 2: Run ────────────────────────────────
FROM eclipse-temurin:17-jre-alpine

RUN addgroup -S nour && adduser -S nour -G nour

WORKDIR /app

COPY --from=builder /app/build/libs/*.jar app.jar

RUN chown nour:nour app.jar
USER nour

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD wget -qO- http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["java", "-jar", "app.jar"]