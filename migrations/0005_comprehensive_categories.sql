-- Migration to add hierarchical many-to-many category system for Projects and Blogs
CREATE TABLE IF NOT EXISTS Categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    type TEXT NOT NULL, -- 'project' or 'blog'
    parentId INTEGER REFERENCES Categories(id),
    sortOrder INTEGER DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Junction table for Projects and Categories
CREATE TABLE IF NOT EXISTS ProjectCategories (
    projectId TEXT REFERENCES Projects(id) ON DELETE CASCADE,
    categoryId INTEGER REFERENCES Categories(id) ON DELETE CASCADE,
    PRIMARY KEY (projectId, categoryId)
);

-- Junction table for BlogPosts and Categories
CREATE TABLE IF NOT EXISTS BlogCategories (
    blogPostId TEXT REFERENCES BlogPosts(id) ON DELETE CASCADE,
    categoryId INTEGER REFERENCES Categories(id) ON DELETE CASCADE,
    PRIMARY KEY (blogPostId, categoryId)
);

-- Seed some initial categories based on existing data
-- Note: Existing categories in Projects/BlogPosts are strings. We'll create them as categories.
INSERT OR IGNORE INTO Categories (name, slug, type) VALUES ('Web', 'web', 'project');
INSERT OR IGNORE INTO Categories (name, slug, type) VALUES ('Mobile', 'mobile', 'project');
INSERT OR IGNORE INTO Categories (name, slug, type) VALUES ('Open Source', 'open-source', 'project');
INSERT OR IGNORE INTO Categories (name, slug, type) VALUES ('Tech', 'tech', 'blog');
INSERT OR IGNORE INTO Categories (name, slug, type) VALUES ('Design', 'design', 'blog');

-- Migrate existing project categories (this is tricky because current category is a single string)
-- We'll link projects to their existing category if it matches.
INSERT OR IGNORE INTO ProjectCategories (projectId, categoryId)
SELECT p.id, c.id FROM Projects p JOIN Categories c ON p.category = c.name WHERE c.type = 'project';

-- Migrate existing blog categories
INSERT OR IGNORE INTO BlogCategories (blogPostId, categoryId)
SELECT b.id, c.id FROM BlogPosts b JOIN Categories c ON b.category = c.name WHERE c.type = 'blog';
