export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  status: 'published' | 'draft';
  date: string;
  tags: string[];
  imageUrl?: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  price?: string;
}

export interface Skill {
  id: string;
  name: string;
  category: 'frontend' | 'backend' | 'design' | 'tools';
  proficiency: number; // 0-100
}

export interface PageContent {
  id: string;
  slug: string;
  title: string;
  content: string;
}

export interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

// Dummy export to ensure this file is treated as a module in JS
export const __types = true;