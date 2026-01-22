export type ProjectRow = {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  publishedAt: string;
};

export const PROJECTS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS Projects (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  imageUrl TEXT NOT NULL,
  publishedAt TEXT NOT NULL
);
`;
