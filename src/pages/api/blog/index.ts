import type { APIRoute } from 'astro';
import { getBlogPosts } from '../../../lib/db';

const slugify = (text: string) => {
  const trMap: Record<string, string> = {
    'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
    'Ç': 'c', 'Ğ': 'g', 'İ': 'i', 'Ö': 'o', 'Ş': 's', 'Ü': 'u'
  };
  for (const key in trMap) {
    text = text.replace(new RegExp(key, 'g'), trMap[key]);
  }
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
};

export const GET: APIRoute = async ({ locals }) => {
  const db = locals.runtime?.env?.DB;
  if (!db) return new Response(JSON.stringify({ error: 'DB missing' }), { status: 500 });

  try {
    const posts = await getBlogPosts(db);
    return new Response(JSON.stringify(posts), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch blog posts' }), { status: 500 });
  }
};

export const POST: APIRoute = async ({ request, locals }) => {
  const db = locals.runtime?.env?.DB;
  if (!db) return new Response(JSON.stringify({ error: 'DB missing' }), { status: 500 });

  try {
    const body = await request.json();
    const { 
      title, excerpt, content, imageUrl, category, categoryIds, readTime,
      metaTitle, metaDescription, focusKeyword, ogImageUrl 
    } = body;
    
    const id = crypto.randomUUID();
    const slug = body.slug || slugify(title);
    const date = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

    const statements = [
      db.prepare(`
        INSERT INTO BlogPosts (
          id, title, slug, excerpt, content, date, imageUrl, category, readTime,
          metaTitle, metaDescription, focusKeyword, ogImageUrl
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        id, title, slug, excerpt, content || null, date, imageUrl, category || 'Tech', readTime || '5 min read',
        metaTitle || null, metaDescription || null, focusKeyword || null, ogImageUrl || null
      )
    ];

    if (categoryIds && Array.isArray(categoryIds)) {
      categoryIds.forEach(catId => {
        statements.push(
          db.prepare('INSERT INTO BlogCategories (blogPostId, categoryId) VALUES (?, ?)').bind(id, catId)
        );
      });
    }

    await db.batch(statements);
    
    return new Response(JSON.stringify({ id, success: true }), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to create blog post' }), { status: 500 });
  }
};
