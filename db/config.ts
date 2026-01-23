// db/config.ts
export type ProjectRow = {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
  tags?: string; // JSON string
  imageUrl: string;
  category: string;
  demoUrl?: string;
  githubUrl?: string;
  features?: string; // JSON string
  gallery?: string; // JSON string
  role?: string;
  year?: string;
  publishedAt: string;
};

export type SkillRow = {
  id: number;
  name: string;
  icon?: string;
  description?: string;
  category: string;
  level: number;
};

export type BlogPostRow = {
  id: string;
  title: string;
  excerpt: string;
  content?: string;
  date: string;
  readTime?: string;
  imageUrl: string;
  category: string;
};

export type ExperienceRow = {
  id: number;
  company: string;
  position: string;
  period: string;
  description?: string; // JSON string
  logo?: string;
};

export type SettingRow = {
  key: string;
  value: string; // JSON string
};
