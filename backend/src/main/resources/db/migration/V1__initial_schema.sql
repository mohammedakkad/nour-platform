-- V1__initial_schema.sql
-- Nour Platform — Initial Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ──────────────────────────────────────────────
-- ENUMS
-- ──────────────────────────────────────────────

CREATE TYPE user_role AS ENUM (
    'STUDENT', 'TEACHER', 'SCHOOL_ADMIN', 'PARENT', 'DONOR', 'SUPER_ADMIN'
);

CREATE TYPE content_type AS ENUM (
    'LESSON', 'WORKSHEET', 'QUIZ', 'VIDEO', 'AUDIO'
);

CREATE TYPE content_status AS ENUM (
    'DRAFT', 'REVIEW', 'PUBLISHED', 'ARCHIVED'
);

CREATE TYPE notification_type AS ENUM (
    'EXAM_RESULT', 'NEW_CONTENT', 'ASSIGNMENT', 'ALERT'
);

CREATE TYPE delivery_channel AS ENUM (
    'IN_APP', 'PUSH', 'SMS'
);

-- ──────────────────────────────────────────────
-- SCHOOLS
-- ──────────────────────────────────────────────

CREATE TABLE schools (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_ar         TEXT NOT NULL,
    region          VARCHAR(100),
    governorate     VARCHAR(100),
    latitude        DECIMAL(10, 8),
    longitude       DECIMAL(11, 8),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ──────────────────────────────────────────────
-- CLASSES
-- ──────────────────────────────────────────────

CREATE TABLE classes (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(100) NOT NULL,
    school_id       UUID NOT NULL REFERENCES schools(id),
    teacher_id      UUID,              -- FK set after users table
    grade_level     INT NOT NULL CHECK (grade_level BETWEEN 1 AND 12),
    academic_year   VARCHAR(9) NOT NULL,
    enrollment_code VARCHAR(8) UNIQUE NOT NULL,
    max_students    INT NOT NULL DEFAULT 40,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ──────────────────────────────────────────────
-- USERS
-- ──────────────────────────────────────────────

CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username        VARCHAR(50) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    full_name_ar    TEXT NOT NULL,
    role            user_role NOT NULL,
    school_id       UUID REFERENCES schools(id),
    class_id        UUID REFERENCES classes(id),
    parent_id       UUID REFERENCES users(id),    -- for students
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    fcm_token       TEXT,
    last_sync       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add FK from classes to teacher (users)
ALTER TABLE classes ADD CONSTRAINT fk_teacher
    FOREIGN KEY (teacher_id) REFERENCES users(id);

-- Indexes
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_school ON users(school_id);
CREATE INDEX idx_users_class ON users(class_id);

-- ──────────────────────────────────────────────
-- CONTENT ITEMS
-- ──────────────────────────────────────────────

CREATE TABLE content_items (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title_ar            TEXT NOT NULL,
    type                content_type NOT NULL,
    subject             VARCHAR(50) NOT NULL,
    grade_level         INT NOT NULL CHECK (grade_level BETWEEN 1 AND 12),
    status              content_status NOT NULL DEFAULT 'DRAFT',
    created_by_id       UUID NOT NULL REFERENCES users(id),
    approved_by_id      UUID REFERENCES users(id),
    file_url            TEXT,
    file_size_mb        DECIMAL(10,2) DEFAULT 0,
    duration_minutes    INT,
    download_count      INT NOT NULL DEFAULT 0,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_content_status ON content_items(status);
CREATE INDEX idx_content_grade ON content_items(grade_level);

-- ──────────────────────────────────────────────
-- EXAMS
-- ──────────────────────────────────────────────

CREATE TABLE exams (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title_ar            TEXT NOT NULL,
    content_id          UUID REFERENCES content_items(id),
    class_id            UUID NOT NULL REFERENCES classes(id),
    created_by_id       UUID NOT NULL REFERENCES users(id),
    time_limit_minutes  INT NOT NULL CHECK (time_limit_minutes BETWEEN 5 AND 180),
    max_attempts        INT NOT NULL DEFAULT 3,
    pass_score          DECIMAL(5,2) NOT NULL DEFAULT 60.0,
    available_from      TIMESTAMPTZ NOT NULL,
    available_until     TIMESTAMPTZ NOT NULL,
    shuffle_questions   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE questions (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id             UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    question_text_ar    TEXT NOT NULL,
    options             TEXT[] NOT NULL,
    correct_option_index INT NOT NULL,
    order_index         INT NOT NULL,
    explanation         TEXT
);

CREATE INDEX idx_questions_exam ON questions(exam_id);

-- ──────────────────────────────────────────────
-- EXAM SUBMISSIONS
-- ──────────────────────────────────────────────

CREATE TABLE exam_submissions (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id             UUID NOT NULL REFERENCES exams(id),
    student_id          UUID NOT NULL REFERENCES users(id),
    attempt_number      INT NOT NULL,
    score               DECIMAL(5,2),
    answers_json        JSONB NOT NULL DEFAULT '{}',
    started_at          TIMESTAMPTZ NOT NULL,
    submitted_at        TIMESTAMPTZ,
    duration_seconds    INT,
    is_passed           BOOLEAN,
    offline_submission  BOOLEAN NOT NULL DEFAULT FALSE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (exam_id, student_id, attempt_number)
);

CREATE INDEX idx_submissions_student ON exam_submissions(student_id);
CREATE INDEX idx_submissions_exam ON exam_submissions(exam_id);

-- ──────────────────────────────────────────────
-- NOTIFICATIONS
-- ──────────────────────────────────────────────

CREATE TABLE notifications (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_id        UUID NOT NULL REFERENCES users(id),
    sender_id           UUID REFERENCES users(id),
    type                notification_type NOT NULL,
    title_ar            TEXT NOT NULL,
    body_ar             TEXT NOT NULL,
    is_read             BOOLEAN NOT NULL DEFAULT FALSE,
    delivery_channel    delivery_channel NOT NULL DEFAULT 'IN_APP',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_recipient ON notifications(recipient_id);
CREATE INDEX idx_notifications_unread ON notifications(recipient_id, is_read) WHERE is_read = FALSE;

-- ──────────────────────────────────────────────
-- SEED DATA — Default Super Admin
-- ──────────────────────────────────────────────

-- Password: Admin@Nour2024 (BCrypt hash)
INSERT INTO users (id, username, password_hash, full_name_ar, role, is_active)
VALUES (
    uuid_generate_v4(),
    'superadmin',
    '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',  -- change before deploy
    'مدير النظام',
    'SUPER_ADMIN',
    TRUE
);
