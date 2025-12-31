import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import nodemailer from 'nodemailer';

admin.initializeApp();

type ReportData = {
  userEmail?: string;
  location?: string;
  description?: string;
  category?: string;
  status?: string;
  latitude?: number;
  longitude?: number;
  timestamp?: admin.firestore.Timestamp;
};

type SmtpConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
};

function readSmtpConfig(): SmtpConfig {
  const cfg = functions.config();

  const host = process.env.SMTP_HOST ?? cfg.smtp?.host;
  const portRaw = process.env.SMTP_PORT ?? cfg.smtp?.port;
  const secureRaw = process.env.SMTP_SECURE ?? cfg.smtp?.secure;
  const user = process.env.SMTP_USER ?? cfg.smtp?.user;
  const pass = process.env.SMTP_PASS ?? cfg.smtp?.pass;
  const from = process.env.SMTP_FROM ?? cfg.smtp?.from;

  if (!host || !portRaw || !user || !pass || !from) {
    throw new Error(
      'Missing SMTP config. Set env vars SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS/SMTP_FROM (or firebase functions config under smtp.*).',
    );
  }

  const port = Number(portRaw);
  if (!Number.isFinite(port)) {
    throw new Error(`Invalid SMTP_PORT: ${String(portRaw)}`);
  }

  const secure = String(secureRaw ?? '').toLowerCase() === 'true' || port === 465;

  return { host, port, secure, user, pass, from };
}

function isValidEmail(email: unknown): email is string {
  if (typeof email !== 'string') return false;
  const trimmed = email.trim();
  if (trimmed.length < 3) return false;
  // Simple email validation; avoids being overly strict.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatTimestamp(ts?: admin.firestore.Timestamp): string {
  if (!ts) return 'Unknown time';
  const date = ts.toDate();
  return date.toISOString();
}

export const emailAdminsOnNewReport = functions.firestore
  .document('reports/{reportId}')
  .onCreate(async (snap: functions.firestore.QueryDocumentSnapshot, context: functions.EventContext) => {
    const reportId = context.params.reportId as string;
    const data = (snap.data() ?? {}) as ReportData;

    const adminsSnap = await admin.firestore().collection('admins').get();
    const adminEmails = Array.from(
      new Set(
        adminsSnap.docs
          .map((d) => (d.data() as { email?: unknown }).email)
          .filter(isValidEmail)
          .map((e) => e.trim().toLowerCase()),
      ),
    );

    if (adminEmails.length === 0) {
      functions.logger.warn('No admin emails found in admins collection; skipping email send.', { reportId });
      return;
    }

    const smtp = readSmtpConfig();
    const transporter = nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.secure,
      auth: {
        user: smtp.user,
        pass: smtp.pass,
      },
    });

    const category = data.category ?? 'Uncategorized';
    const status = data.status ?? 'Pending';
    const userEmail = data.userEmail ?? 'Unknown user';
    const location = data.location ?? 'Unknown location';
    const description = data.description ?? '';
    const when = formatTimestamp(data.timestamp);

    const subject = `[ADUONE] New report: ${category} (${status})`;

    const detailsLines: string[] = [
      `Report ID: ${reportId}`,
      `Category: ${category}`,
      `Status: ${status}`,
      `Reported by: ${userEmail}`,
      `Location: ${location}`,
      `Time: ${when}`,
    ];

    if (typeof data.latitude === 'number' && typeof data.longitude === 'number') {
      detailsLines.push(`Coordinates: ${data.latitude}, ${data.longitude}`);
    }

    const textBody = `${detailsLines.join('\n')}\n\nDescription:\n${description}`.trim();

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h2 style="margin: 0 0 12px;">New ADUONE report received</h2>
        <p style="margin: 0 0 16px;">A new report has been submitted and needs review.</p>
        <table cellpadding="6" cellspacing="0" style="border-collapse: collapse;">
          ${detailsLines
            .map((line) => {
              const [k, ...rest] = line.split(':');
              const v = rest.join(':').trim();
              return `<tr><td style="color:#334155;"><b>${escapeHtml(k)}:</b></td><td>${escapeHtml(v)}</td></tr>`;
            })
            .join('')}
        </table>
        <h3 style="margin: 18px 0 8px;">Description</h3>
        <pre style="background:#f8fafc; padding: 12px; border-radius: 8px; white-space: pre-wrap;">${escapeHtml(
          description || '(no description)',
        )}</pre>
      </div>
    `.trim();

    functions.logger.info('Sending admin email notifications', {
      reportId,
      adminEmailCount: adminEmails.length,
    });

    await transporter.sendMail({
      from: smtp.from,
      to: adminEmails,
      subject,
      text: textBody,
      html: htmlBody,
    });

    functions.logger.info('Admin email notifications sent', { reportId });
  });
