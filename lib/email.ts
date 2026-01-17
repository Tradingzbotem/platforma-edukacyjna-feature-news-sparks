import nodemailer from 'nodemailer';

type ContactEmailPayload = {
  name: string;
  email: string;
  subject: string;
  message: string;
  topic?: string;
  phone?: string;
  preferred?: string;
  ip?: string;
  ua?: string;
};

function getSmtpConfig() {
  const host = process.env.SMTP_HOST || '';
  const port = Number(process.env.SMTP_PORT || '587');
  const user = process.env.SMTP_USER || '';
  const pass = process.env.SMTP_PASS || '';
  const secureEnv = (process.env.SMTP_SECURE || '').toLowerCase();
  const secure = secureEnv ? ['1', 'true', 'yes'].includes(secureEnv) : port === 465;
  const allowSelfSignedEnv = (process.env.SMTP_ALLOW_SELF_SIGNED || '').toLowerCase();
  const allowSelfSigned = ['1', 'true', 'yes'].includes(allowSelfSignedEnv);
  const from =
    process.env.SMTP_FROM ||
    `Platforma Edukacyjna <kontakt@platforma-edukacyjna.com>`;
  const to =
    process.env.CONTACT_TO || 'kontakt@platforma-edukacyjna.com';

  return { host, port, user, pass, secure, allowSelfSigned, from, to };
}

export async function sendContactEmail(
  data: ContactEmailPayload,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { host, port, user, pass, secure, allowSelfSigned, from, to } = getSmtpConfig();

  // If SMTP is not configured, skip silently (API still stores message in DB)
  if (!host || !user || !pass) {
    return { ok: false, error: 'SMTP_NOT_CONFIGURED' };
  }

  const tlsOptions: Record<string, unknown> = {
    servername: host,
    minVersion: 'TLSv1.2',
  };
  if (allowSelfSigned) {
    // Dev-only: allow local proxies/AV that inject self-signed certs
    (tlsOptions as any).rejectUnauthorized = false;
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    requireTLS: !secure, // STARTTLS for 587
    tls: tlsOptions,
  });

  const subject = `[Kontakt] ${data.subject}`.slice(0, 160);
  const lines = [
    `Nowa wiadomość z formularza kontaktowego:`,
    ``,
    `Imię: ${data.name}`,
    `Email: ${data.email}`,
    data.phone ? `Telefon: ${data.phone}` : undefined,
    data.preferred ? `Preferowana forma kontaktu: ${data.preferred}` : undefined,
    data.topic ? `Temat (kategoria): ${data.topic}` : undefined,
    ``,
    `Treść:`,
    data.message,
    ``,
    data.ip ? `IP: ${data.ip}` : undefined,
    data.ua ? `User-Agent: ${data.ua}` : undefined,
  ].filter(Boolean) as string[];

  const text = lines.join('\n');
  const html = `<div>
  <p><strong>Nowa wiadomość z formularza kontaktowego</strong></p>
  <ul>
    <li><strong>Imię:</strong> ${escapeHtml(data.name)}</li>
    <li><strong>Email:</strong> ${escapeHtml(data.email)}</li>
    ${data.phone ? `<li><strong>Telefon:</strong> ${escapeHtml(data.phone)}</li>` : ''}
    ${data.preferred ? `<li><strong>Preferowana forma kontaktu:</strong> ${escapeHtml(data.preferred)}</li>` : ''}
    ${data.topic ? `<li><strong>Temat (kategoria):</strong> ${escapeHtml(data.topic)}</li>` : ''}
  </ul>
  <p><strong>Treść:</strong></p>
  <pre style="white-space:pre-wrap;font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;">${escapeHtml(data.message)}</pre>
  <hr />
  <p style="color:#666;font-size:12px;">
    ${data.ip ? `IP: ${escapeHtml(data.ip)} ` : ''}${data.ua ? `• UA: ${escapeHtml(data.ua)}` : ''}
  </p>
</div>`;

  try {
    await transporter.sendMail({
      from,
      to,
      replyTo: data.email,
      subject,
      text,
      html,
    });
    return { ok: true };
  } catch (err: any) {
    const message = err?.message || String(err);
    return { ok: false, error: message };
  }
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}


