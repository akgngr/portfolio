import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ locals }) => {
  const db = locals.runtime?.env?.DB;
  if (!db) return new Response(JSON.stringify({ error: 'DB missing' }), { status: 500 });

  try {
    const projectsCount = await db.prepare('SELECT COUNT(*) as count FROM Projects').first('count');
    const skillsCount = await db.prepare('SELECT COUNT(*) as count FROM Skills').first('count');
    const blogCount = await db.prepare('SELECT COUNT(*) as count FROM BlogPosts').first('count');
    const expCount = await db.prepare('SELECT COUNT(*) as count FROM Experiences').first('count');

    return new Response(JSON.stringify({
      projects: projectsCount,
      skills: skillsCount,
      blog: blogCount,
      experience: expCount
    }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch stats' }), { status: 500 });
  }
};
