-- Initialize HonoCom database
-- This file runs when the PostgreSQL container starts for the first time

\echo 'Initializing HonoCom database...'

-- Create database if it doesn't exist (handled by POSTGRES_DB env var)
-- CREATE DATABASE IF NOT EXISTS honocom;

-- Set timezone
SET timezone = 'UTC';

\echo 'HonoCom database initialization complete.'