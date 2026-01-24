-- Add Experience category support
ALTER TABLE Experiences ADD COLUMN categoryId INTEGER REFERENCES Categories(id);

-- Create ExperienceCategories junction table (optional, but let's stay consistent with projects/blogs if we want many-to-many)
-- Actually, the user asked for "kendi kategorisi olsun" which might mean one category per item like Skills.
-- But for Projects and Blogs I did many-to-many.
-- For consistency, let's stick to many-to-many if possible, or just a single categoryId if it's simpler.
-- SkillCategories uses single categoryId.

-- Let's stick to single categoryId for Experiences to match Skills, 
-- but I'll use the generic Categories table.

-- First, let's update the Categories table to allow 'experience' type
-- (No change needed to schema, just data)

INSERT OR IGNORE INTO Categories (name, slug, type) VALUES ('Work', 'work', 'experience');
INSERT OR IGNORE INTO Categories (name, slug, type) VALUES ('Education', 'education', 'experience');
INSERT OR IGNORE INTO Categories (name, slug, type) VALUES ('Volunteering', 'volunteering', 'experience');
