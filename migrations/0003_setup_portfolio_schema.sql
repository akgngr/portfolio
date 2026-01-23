-- Migration number: 0003 	 2026-01-23
-- Setup comprehensive portfolio schema based on devportfolio-pro

-- Update Projects table if it exists, or create it
DROP TABLE IF EXISTS Projects;
CREATE TABLE Projects (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    longDescription TEXT,
    tags TEXT, -- JSON array
    imageUrl TEXT NOT NULL,
    category TEXT NOT NULL, -- Web, Mobile, Design, Open Source
    demoUrl TEXT,
    githubUrl TEXT,
    features TEXT, -- JSON array
    gallery TEXT, -- JSON array
    role TEXT,
    year TEXT,
    publishedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create Skills table
CREATE TABLE IF NOT EXISTS Skills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    icon TEXT,
    description TEXT,
    category TEXT NOT NULL, -- Frontend, Backend, DevOps, Tools, Soft Skills
    level INTEGER DEFAULT 0
);

-- Create BlogPosts table
CREATE TABLE IF NOT EXISTS BlogPosts (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    excerpt TEXT NOT NULL,
    content TEXT,
    date TEXT NOT NULL,
    readTime TEXT,
    imageUrl TEXT NOT NULL,
    category TEXT NOT NULL
);

-- Create Experiences table
CREATE TABLE IF NOT EXISTS Experiences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company TEXT NOT NULL,
    position TEXT NOT NULL,
    period TEXT NOT NULL,
    description TEXT, -- JSON array
    logo TEXT
);

-- Create Settings table for Profile and Page Data
CREATE TABLE IF NOT EXISTS Settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL -- JSON object
);
