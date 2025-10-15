import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * POST /api/contact
 * body: { name: string, email: string, subject: string, message: string }
 */
export async function POST(req: Request) {
  try {
    const { name, email, subject, message } = await req.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // sanitize Neon connection string similar to other routes
    const rawUrl = (process.env.POSTGRES_URL || '').trim();
    let connStr = rawUrl;
    if (connStr.startsWith('psql ')) {
      const m = connStr.match(/^psql\s+'(.+)'/);
      connStr = m ? m[1] : connStr.replace(/^psql\s+/, '').replace(/^'+|'+$/g, '');
    }
    const sql = neon(connStr);

    await sql`
      CREATE TABLE IF NOT EXISTS contact_messages (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        subject TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT now()
      )
    `;

    await sql`
      INSERT INTO contact_messages (name, email, subject, message)
      VALUES (${name}, ${email}, ${subject}, ${message})
    `;

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('Contact submit error', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}



