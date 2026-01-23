// src/lib/db.ts
import type { ProjectRow, SkillRow, BlogPostRow, ExperienceRow, SettingRow } from '../../db/config';

export const getProjects = async (db: D1Database) => {
  const { results } = await db.prepare('SELECT * FROM Projects ORDER BY publishedAt DESC').all<ProjectRow>();
  return (results || []).map(p => ({
    ...p,
    tags: JSON.parse(p.tags || '[]'),
    features: JSON.parse(p.features || '[]'),
    gallery: JSON.parse(p.gallery || '[]')
  }));
};

export const getProjectById = async (db: D1Database, id: string) => {
  const project = await db.prepare('SELECT * FROM Projects WHERE id = ?').bind(id).first<ProjectRow>();
  if (!project) return null;
  return {
    ...project,
    tags: JSON.parse(project.tags || '[]'),
    features: JSON.parse(project.features || '[]'),
    gallery: JSON.parse(project.gallery || '[]')
  };
};

export const getSkills = async (db: D1Database) => {
  const { results } = await db.prepare('SELECT * FROM Skills ORDER BY category, level DESC').all<SkillRow>();
  return results || [];
};

export const getBlogPosts = async (db: D1Database) => {
  const { results } = await db.prepare('SELECT * FROM BlogPosts ORDER BY date DESC').all<BlogPostRow>();
  return results || [];
};

export const getBlogPostById = async (db: D1Database, id: string) => {
  return await db.prepare('SELECT * FROM BlogPosts WHERE id = ?').bind(id).first<BlogPostRow>();
};

export const getExperiences = async (db: D1Database) => {
  const { results } = await db.prepare('SELECT * FROM Experiences ORDER BY id DESC').all<ExperienceRow>();
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
