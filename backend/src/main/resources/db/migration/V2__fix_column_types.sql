-- Fix file_size_mb column type: DECIMAL -> DOUBLE PRECISION
ALTER TABLE content_items 
    ALTER COLUMN file_size_mb TYPE DOUBLE PRECISION 
    USING file_size_mb::DOUBLE PRECISION;
