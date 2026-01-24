// src/lib/db.ts
import type { ProjectRow, SkillRow, BlogPostRow, ExperienceRow, SettingRow } from '../../db/config';

export const getProjects = async (db: D1Database) => {
  const { results: projects } = await db.prepare('SELECT * FROM Projects ORDER BY publishedAt DESC').all<ProjectRow>();
  
  // Fetch categories for each project
  const { results: associations } = await db.prepare(`
    SELECT pc.projectId, c.* 
    FROM ProjectCategories pc 
    JOIN Categories c ON pc.categoryId = c.id
  `).all<{ projectId: string } & any>();

  return (projects || []).map(p => ({
    ...p,
    tags: JSON.parse(p.tags || '[]'),
    features: JSON.parse(p.features || '[]'),
    gallery: JSON.parse(p.gallery || '[]'),
    categories: associations?.filter(a => a.projectId === p.id) || []
  }));
};

export const getProjectById = async (db: D1Database, id: string) => {
  const project = await db.prepare('SELECT * FROM Projects WHERE id = ?').bind(id).first<ProjectRow>();
  if (!project) return null;

  const { results: categories } = await db.prepare(`
    SELECT c.* 
    FROM Categories c 
    JOIN ProjectCategories pc ON c.id = pc.categoryId 
    WHERE pc.projectId = ?
  `).bind(id).all();

  return {
    ...project,
    tags: JSON.parse(project.tags || '[]'),
    features: JSON.parse(project.features || '[]'),
    gallery: JSON.parse(project.gallery || '[]'),
    categories: categories || []
  };
};

export const getSkills = async (db: D1Database) => {
  const { results } = await db.prepare(`
    SELECT s.*, c.name as categoryName 
    FROM Skills s
    LEFT JOIN SkillCategories c ON s.categoryId = c.id
    ORDER BY c.sortOrder ASC, s.level DESC
  `).all<SkillRow & { categoryName: string }>();
  return results || [];
};

export const getSkillCategories = async (db: D1Database) => {
  const { results } = await db.prepare('SELECT * FROM SkillCategories ORDER BY sortOrder ASC, name ASC').all();
  return results || [];
};

export const getBlogPosts = async (db: D1Database) => {
  const { results: posts } = await db.prepare('SELECT * FROM BlogPosts ORDER BY date DESC').all<BlogPostRow>();
  
  // Fetch categories for each post
  const { results: associations } = await db.prepare(`
    SELECT bc.blogPostId, c.* 
    FROM BlogCategories bc 
    JOIN Categories c ON bc.categoryId = c.id
  `).all<{ blogPostId: string } & any>();

  return (posts || []).map(p => ({
    ...p,
    categories: associations?.filter(a => a.blogPostId === p.id) || []
  }));
};

export const getBlogPostById = async (db: D1Database, idOrSlug: string) => {
  const post = await db.prepare('SELECT * FROM BlogPosts WHERE id = ? OR slug = ?').bind(idOrSlug, idOrSlug).first<BlogPostRow>();
  if (!post) return null;

  const { results: categories } = await db.prepare(`
    SELECT c.* 
    FROM Categories c 
    JOIN BlogCategories bc ON c.id = bc.categoryId 
    WHERE bc.blogPostId = ?
  `).bind(post.id).all();

  return {
    ...post,
    categories: categories || []
  };
};

export const getCategories = async (db: D1Database, type?: 'project' | 'blog') => {
  let query = 'SELECT * FROM Categories';
  if (type) {
    query += ' WHERE type = ?';
  }
  query += ' ORDER BY parentId ASC, sortOrder ASC, name ASC';
  
  const { results } = await (type ? db.prepare(query).bind(type).all() : db.prepare(query).all());
  return results || [];
};

export const getExperiences = async (db: D1Database) => {
  const { results } = await db.prepare(`
    SELECT e.*, c.name as categoryName 
    FROM Experiences e
    LEFT JOIN Categories c ON e.categoryId = c.id
    ORDER BY e.id DESC
  `).all<ExperienceRow & { categoryName: string }>();
  
  return (results || []).map(e => ({
    ...e,
    description: JSON.parse(e.description || '[]')
  }));
};

export const getProfile = async (db: D1Database) => {
  const setting = await db.prepare('SELECT value FROM Settings WHERE key = "profile"').first<SettingRow>();
  if (!setting) return null;
  return JSON.parse(setting.value);
};
