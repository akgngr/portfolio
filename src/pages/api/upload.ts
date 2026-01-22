import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, locals }) => {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  const filename = formData.get('filename') as string;

  if (!file || !filename) {
    return new Response(JSON.stringify({ error: 'Missing file or filename' }), { 
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    // Use the R2 bucket binding from locals
    // Note: ensure 'R2_ASSETS' matches your wrangler.toml binding
    await locals.runtime.env.R2_ASSETS.put(filename, arrayBuffer, {
      httpMetadata: {
        contentType: file.type || 'application/octet-stream'
      }
    });
    
    const base = locals.runtime.env.R2_PUBLIC_BASE_URL;
    if (!base) {
      return new Response(
        JSON.stringify({
          error:
            'Missing env.R2_PUBLIC_BASE_URL. Set it to your public R2 domain (e.g. https://<bucket>.<account>.r2.dev/ or a custom domain).'
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const normalizedBase = base.endsWith('/') ? base : `${base}/`;
    const url = new URL(filename, normalizedBase).toString();

    return new Response(JSON.stringify({ 
      success: true, 
      url 
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return new Response(JSON.stringify({ error: 'Upload failed' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
