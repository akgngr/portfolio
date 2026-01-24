-- Add SEO and Slug fields to BlogPosts
ALTER TABLE BlogPosts ADD COLUMN slug TEXT;
ALTER TABLE BlogPosts ADD COLUMN metaTitle TEXT;
ALTER TABLE BlogPosts ADD COLUMN metaDescription TEXT;
ALTER TABLE BlogPosts ADD COLUMN focusKeyword TEXT;
ALTER TABLE BlogPosts ADD COLUMN ogImageUrl TEXT;

-- Update existing posts with a basic slug based on their ID if slug is null
UPDATE BlogPosts SET slug = LOWER(REPLACE(title, ' ', '-')) WHERE slug IS NULL;
