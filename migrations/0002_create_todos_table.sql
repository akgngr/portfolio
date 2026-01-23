-- Migration for Todos table
CREATE TABLE IF NOT EXISTS Todos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task TEXT NOT NULL,
  isCompleted INTEGER DEFAULT 0, -- SQLite doesn't have Boolean, use 0/1
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
