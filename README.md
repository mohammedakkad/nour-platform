# 🌟 نور — Nour Platform v2.0

> **Offline-First Educational Platform for Students in Conflict Zones**

A complete full-stack educational platform built with modern technologies, designed to work reliably with intermittent internet connectivity.

---

## 📱 Platform Overview

| Component | Technology | Status |
|-----------|-----------|--------|
| Android App | Kotlin + Jetpack Compose | ✅ MVP |
| Backend API | Spring Boot 3 + Kotlin | ✅ MVP |
| Web Dashboard | React + GitHub Pages | ✅ MVP |
| Database | PostgreSQL + Room (local) | ✅ MVP |
| CI/CD | GitHub Actions | ✅ Configured |

---

## 👥 User Roles

| Role | Arabic | Permissions |
|------|--------|-------------|
| `STUDENT` | طالب | View lessons, take exams, track progress |
| `TEACHER` | معلم | Upload content, create exams, manage class |
| `SCHOOL_ADMIN` | مشرف | Approve content, manage institution |
| `PARENT` | ولي الأمر | Monitor children, receive notifications |
| `DONOR` | مانح | View analytics, export reports |
| `SUPER_ADMIN` | مدير عام | Full system access |

---

## 🗂️ Project Structure

```
nour-platform/
├── 📱 android/          → Android app (Kotlin + Jetpack Compose)
├── 🖥️  backend/         → Spring Boot API (Kotlin)
├── 🌐 web/              → Web dashboard (React → GitHub Pages)
└── ⚙️  .github/         → GitHub Actions CI/CD workflows
```

---

## 🚀 Quick Start

### Backend
```bash
cd backend
./gradlew bootRun
# API runs on http://localhost:8080
# Swagger UI: http://localhost:8080/swagger-ui.html
```

### Android
```bash
cd android
./gradlew assembleDebug
# APK in: app/build/outputs/apk/debug/
```

### Web (GitHub Pages)
```bash
# Push to main branch → auto-deploys via GitHub Actions
# Or run locally:
cd web && npx serve .
```

---

## ⚙️ GitHub Actions Workflows

| Workflow | Trigger | Action |
|----------|---------|--------|
| `android-build.yml` | Push to `main`/`develop` | Build & sign APK, upload artifact |
| `backend-ci.yml` | Push to `main`/PR | Test, build JAR, Docker image |
| `web-deploy.yml` | Push to `main` | Deploy to GitHub Pages |

---

## 🔑 Environment Variables

### Backend (`backend/src/main/resources/application.yml`)
```yaml
DATABASE_URL: postgresql://localhost:5432/nour_db
DATABASE_USERNAME: nour_user
DATABASE_PASSWORD: your_password
JWT_SECRET: your_256_bit_secret
JWT_EXPIRY_HOURS: 24
FCM_SERVER_KEY: your_firebase_key
S3_BUCKET: nour-content
S3_REGION: us-east-1
```

### GitHub Secrets (for Actions)
```
KEYSTORE_BASE64       → Base64 encoded Android keystore
KEY_ALIAS             → Keystore key alias
KEY_PASSWORD          → Key password
STORE_PASSWORD        → Store password
DB_PASSWORD           → Database password
JWT_SECRET            → JWT signing secret
DOCKER_USERNAME       → Docker Hub username
DOCKER_PASSWORD       → Docker Hub token
```

---

## 📦 Release Roadmap

| Phase | Weeks | Features |
|-------|-------|---------|
| **MVP Core** | 1–6 | Auth, offline mode, MCQ tests, content sync |
| **Beta+** | 7–12 | Teacher dashboard, parent portal, notifications |
| **V1.0** | 13–18 | Donor analytics, PDF reports, geographic maps |
| **V2.0** | 19+ | iOS, AI assistant, adaptive learning |

---

## 📄 License
Educational use only. Built for humanitarian purposes.
