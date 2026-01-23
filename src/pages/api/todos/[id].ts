import type { APIRoute } from 'astro';

export const PATCH: APIRoute = async ({ params, request, locals }) => {
  const db = locals.runtime.env.DB;
  const { id } = params;
  const { isCompleted } = await request.json();

  try {
    await db.prepare('UPDATE Todos SET isCompleted = ? WHERE id = ?')
      .bind(isCompleted ? 1 : 0, id)
      .run();
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to update todo' }), { status: 500 });
  }
};

export const DELETE: APIRoute = async ({ params, locals }) => {
  const db = locals.runtime.env.DB;
  const { id } = params;

  try {
    await db.prepare('DELETE FROM Todos WHERE id = ?').bind(id).run();
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to delete todo' }), { status: 500 });
  }
};
