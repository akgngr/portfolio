-- Migration to add SkillCategories management
CREATE TABLE IF NOT EXISTS SkillCategories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    icon TEXT,
    sortOrder INTEGER DEFAULT 0
);

-- Insert existing categories
INSERT OR IGNORE INTO SkillCategories (name) VALUES ('Frontend'), ('Backend'), ('DevOps'), ('Tools');

-- Update Skills table to include categoryId (optional but recommended for better relational management)
-- For now, we'll keep the category string in Skills but we can also use categoryId.
-- Let's add categoryId to Skills.
ALTER TABLE Skills ADD COLUMN categoryId INTEGER REFERENCES SkillCategories(id);

-- Link existing skills to categories
UPDATE Skills SET categoryId = (SELECT id FROM SkillCategories WHERE SkillCategories.name = Skills.category);
