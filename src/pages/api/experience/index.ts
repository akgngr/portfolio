import type { APIRoute } from 'astro';
import { getExperiences } from '../../../lib/db';

export const GET: APIRoute = async ({ locals }) => {
  const db = locals.runtime?.env?.DB;
  if (!db) return new Response(JSON.stringify({ error: 'DB missing' }), { status: 500 });

  try {
    const experiences = await getExperiences(db);
    return new Response(JSON.stringify(experiences), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch experiences' }), { status: 500 });
  }
};

export const POST: APIRoute = async ({ request, locals }) => {
  const db = locals.runtime?.env?.DB;
  if (!db) return new Response(JSON.stringify({ error: 'DB missing' }), { status: 500 });

  try {
    const { company, position, period, description, logo, categoryId } = await request.json();
    await db.prepare(`
      INSERT INTO Experiences (company, position, period, description, logo, categoryId)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(company, position, period, JSON.stringify(description || []), logo || null, categoryId || null).run();
    
    return new Response(JSON.stringify({ success: true }), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to create experience' }), { status: 500 });
  }
};
