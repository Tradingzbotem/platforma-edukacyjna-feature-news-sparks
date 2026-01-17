import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { sendContactEmail } from '@/lib/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * POST /api/contact
 * body: { name: string, email: string, subject: string, message: string }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = String(body?.name || '').trim();
    const email = String(body?.email || '').trim();
    const subject = String(body?.subject || '').trim();
    const message = String(body?.message || '').trim();
    const topic = String(body?.topic || '').trim();
    const phone = String(body?.phone || '').trim();
    const preferred = String(body?.preferred || '').trim();

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: 'Brak wymaganych pól' }, { status: 400 });
    }

    // basic validation / limits
    if (name.length < 2 || name.length > 80) {
      return NextResponse.json({ error: 'Nieprawidłowe imię' }, { status: 400 });
    }
    if (!email.includes('@') || email.length > 160) {
      return NextResponse.json({ error: 'Nieprawidłowy email' }, { status: 400 });
    }
    if (subject.length < 2 || subject.length > 160) {
      return NextResponse.json({ error: 'Nieprawidłowy temat' }, { status: 400 });
    }
    if (message.length < 10 || message.length > 5000) {
      return NextResponse.json({ error: 'Wiadomość ma nieprawidłową długość' }, { status: 400 });
    }

    // request metadata
    const ipHeader = req.headers.get('x-forwarded-for') || '';
    const ip = ipHeader.split(',')[0]?.trim() || 'unknown';
    const ua = req.headers.get('user-agent') || '';

    // sanitize Neon connection string similar to other routes
    const rawUrl = (process.env.POSTGRES_URL || '').trim();
    let connStr = rawUrl;
    if (connStr.startsWith('psql ')) {
      const m = connStr.match(/^psql\s+'(.+)'/);
      connStr = m ? m[1] : connStr.replace(/^psql\s+/, '').replace(/^'+|'+$/g, '');
    }
    const sql = neon(connStr);

    // ensure table and new columns
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
    await sql`ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS topic TEXT;`;
    await sql`ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS phone TEXT;`;
    await sql`ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS preferred TEXT;`;
    await sql`ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS ip TEXT;`;
    await sql`ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS ua TEXT;`;

    // simple rate limit: 1 request per IP per 60s, max 20/day
    const recent = await sql`
      SELECT count(*)::int AS c FROM contact_messages
      WHERE ip = ${ip} AND created_at > now() - interval '60 seconds'
    ` as unknown as Array<{ c: number }>;
    if (recent[0]?.c > 0) {
      return NextResponse.json({ error: 'Zbyt częste wysyłanie. Spróbuj za minutę.' }, { status: 429 });
    }
    const daily = await sql`
      SELECT count(*)::int AS c FROM contact_messages
      WHERE ip = ${ip} AND created_at::date = now()::date
    ` as unknown as Array<{ c: number }>;
    if (daily[0]?.c >= 20) {
      return NextResponse.json({ error: 'Osiągnięto dzienny limit wiadomości.' }, { status: 429 });
    }

    await sql`
      INSERT INTO contact_messages (name, email, subject, message, topic, phone, preferred, ip, ua)
      VALUES (${name}, ${email}, ${subject}, ${message}, ${topic || null}, ${phone || null}, ${preferred || null}, ${ip}, ${ua})
    `;

    // Optionally send notification email (controlled via CONTACT_EMAIL_ENABLED)
    const enabledRaw = (process.env.CONTACT_EMAIL_ENABLED || '').toLowerCase();
    const emailEnabled = enabledRaw ? ['1', 'true', 'yes'].includes(enabledRaw) : true;
    let emailSent = false;
    if (emailEnabled) {
      const emailResult = await sendContactEmail({
        name,
        email,
        subject,
        message,
        topic,
        phone,
        preferred,
        ip,
        ua,
      });
      emailSent = emailResult.ok === true;
      if (!emailSent) {
        try {
          // eslint-disable-next-line no-console
          console.error('[contact] Email send failed:', (emailResult as any).error);
        } catch {}
      }
    }

    return NextResponse.json({ ok: true, emailSent });
  } catch (err: any) {
    console.error('Contact submit error', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}



