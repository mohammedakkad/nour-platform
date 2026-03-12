# 🚀 دليل الإعداد الكامل — Nour Platform

## 📋 المتطلبات الأساسية

| الأداة | الإصدار | الاستخدام |
|--------|---------|-----------|
| Android Studio | Hedgehog+ | تطوير التطبيق |
| JDK | 17 | Android + Backend |
| Docker Desktop | أحدث إصدار | تشغيل Backend محلياً |
| Node.js | 20+ | تطوير الويب |
| Git | أي إصدار | إدارة الكود |

---

## ⚙️ إعداد GitHub Actions

### الخطوة 1: إنشاء المستودع
```bash
git init
git add .
git commit -m "feat: initial project setup"
git remote add origin https://github.com/YOUR_ORG/nour-platform.git
git push -u origin main
```

### الخطوة 2: إضافة GitHub Secrets
اذهب إلى `Settings → Secrets and variables → Actions` وأضف:

```
# Android Signing
KEYSTORE_BASE64      → base64 -i nour-release.keystore | pbcopy
KEY_ALIAS            → اسم الـ key في الـ keystore
KEY_PASSWORD         → كلمة مرور الـ key
STORE_PASSWORD       → كلمة مرور الـ keystore

# Backend
DB_PASSWORD          → كلمة مرور قاعدة البيانات
JWT_SECRET           → سلسلة عشوائية بطول 32+ حرف

# Docker Hub (للـ CI)
DOCKER_USERNAME      → اسم مستخدم Docker Hub
DOCKER_PASSWORD      → رمز Docker Hub access token
```

### الخطوة 3: إعداد GitHub Pages
1. اذهب إلى `Settings → Pages`
2. Source: `GitHub Actions`
3. سيتم النشر تلقائياً عند الـ push إلى `main`
4. رابط الموقع: `https://YOUR_ORG.github.io/nour-platform/`

---

## 📱 Android — إنشاء keystore للتوقيع

```bash
cd android/app

# إنشاء keystore جديد
keytool -genkey -v \
  -keystore nour-release.keystore \
  -alias nour-key \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000

# تحويل إلى Base64 لـ GitHub Secrets
base64 -i nour-release.keystore | tr -d '\n'
```

احفظ `nour-release.keystore` في مكان آمن (لا ترفعه إلى GitHub!)

### تشغيل محلياً
```bash
cd android
./gradlew assembleDebug

# التطبيق في:
# app/build/outputs/apk/debug/app-debug.apk
```

---

## 🖥️ Backend — تشغيل محلياً

### باستخدام Docker (موصى به)
```bash
# تشغيل قاعدة البيانات + MinIO + Backend + Web
docker-compose up -d

# عرض السجلات
docker-compose logs -f backend

# وقف التشغيل
docker-compose down
```

### بدون Docker
```bash
# 1. تثبيت PostgreSQL وإنشاء قاعدة البيانات
createdb nour_db

# 2. إعداد متغيرات البيئة
export DATABASE_URL=jdbc:postgresql://localhost:5432/nour_db
export DATABASE_USERNAME=postgres
export DATABASE_PASSWORD=your_password
export JWT_SECRET=your_256_bit_secret

# 3. تشغيل التطبيق
cd backend
./gradlew bootRun
```

### روابط مهمة (بعد التشغيل)
- API: http://localhost:8080/api/v1
- Swagger UI: http://localhost:8080/swagger-ui.html
- MinIO Console: http://localhost:9001 (admin/admin123)

---

## 🌐 Web — تشغيل محلياً

```bash
cd web

# تثبيت التبعيات
npm install

# تشغيل بيئة التطوير
npm run dev
# يفتح على http://localhost:3000

# بناء للإنتاج
VITE_API_URL=https://api.nour-platform.org/api/v1 npm run build
```

### تفعيل GitHub Pages
أضف هذا المتغير في `Settings → Variables → Actions`:
```
BACKEND_API_URL = https://api.nour-platform.org/api/v1
```

---

## 🔄 تدفق عمل GitHub Actions

```
Push to main branch
       │
       ├── Android Build Workflow
       │      ├── ✅ Run unit tests
       │      ├── 🔨 Build signed APK
       │      └── 📦 Upload to Releases
       │
       ├── Backend CI Workflow
       │      ├── 🧪 Run tests (against PostgreSQL)
       │      ├── 🔨 Build JAR
       │      └── 🐳 Push Docker image
       │
       └── Web Deploy Workflow
              ├── 🔨 npm run build
              └── 🚀 Deploy to GitHub Pages
```

---

## 📊 هيكل قاعدة البيانات

```sql
schools          -- المؤسسات التعليمية
  └── classes    -- الفصول الدراسية
       └── users -- الطلاب، المعلمون، أولياء الأمور
            ├── content_items    -- المحتوى التعليمي
            ├── exams            -- الاختبارات
            │    └── questions   -- الأسئلة
            │         └── exam_submissions -- إجابات الطلاب
            └── notifications    -- الإشعارات
```

---

## 🛡️ الأمان

- **JWT**: انتهاء صلاحية 24 ساعة + refresh token 30 يوم
- **RBAC**: التحقق من الصلاحيات في كل endpoint
- **BCrypt**: تشفير كلمات المرور (cost factor 12)
- **Flyway**: migrations محكومة لقاعدة البيانات
- **Offline-first**: تشفير البيانات المحلية في التطبيق

---

## 📱 اختبار الـ APK على جهاز حقيقي

1. حمّل APK من GitHub Actions artifacts
2. على الهاتف: `الإعدادات → الأمان → مصادر غير معروفة → تفعيل`
3. افتح ملف APK للتثبيت
4. اختبر في وضع Airplane Mode للتأكد من الـ offline

---

## 📞 المساعدة

- Swagger UI يوثق كل API endpoints تلقائياً
- GitHub Issues لتتبع المشاكل
- GitHub Projects لإدارة المهام
