import { defineDb, defineTable, column } from 'astro:db';

const Projects = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    title: column.text(),
    description: column.text(),
    imageUrl: column.text(),
    publishedAt: column.date()
  }
});

export default defineDb({
  tables: { Projects }
});
