-- Convert PostgreSQL enum columns to VARCHAR for Hibernate compatibility

ALTER TABLE users ALTER COLUMN role TYPE VARCHAR(50);
ALTER TABLE content_items ALTER COLUMN type TYPE VARCHAR(50);
ALTER TABLE content_items ALTER COLUMN status TYPE VARCHAR(50);
ALTER TABLE notifications ALTER COLUMN type TYPE VARCHAR(50);
ALTER TABLE notifications ALTER COLUMN delivery_channel TYPE VARCHAR(50);

-- Drop the enum types
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS content_type CASCADE;
DROP TYPE IF EXISTS content_status CASCADE;
DROP TYPE IF EXISTS notification_type CASCADE;
DROP TYPE IF EXISTS delivery_channel CASCADE;