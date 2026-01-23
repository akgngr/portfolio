import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ locals }) => {
  const db = locals.runtime.env.DB;
  
  try {
    const { results } = await db.prepare('SELECT * FROM Todos ORDER BY createdAt DESC').all();
    return new Response(JSON.stringify(results), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch todos' }), { status: 500 });
  }
};

export const POST: APIRoute = async ({ request, locals }) => {
  const db = locals.runtime.env.DB;
  const { task } = await request.json();

  if (!task) {
    return new Response(JSON.stringify({ error: 'Task is required' }), { status: 400 });
  }

  try {
    await db.prepare('INSERT INTO Todos (task) VALUES (?)').bind(task).run();
    return new Response(JSON.stringify({ success: true }), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to add todo' }), { status: 500 });
  }
};
