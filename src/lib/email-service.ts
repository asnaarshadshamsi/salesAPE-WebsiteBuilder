// Email Service - Handles sending emails via various providers
// Supports SendGrid, Resend, or console logging for development

export interface EmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

// Get email configuration from environment
const EMAIL_PROVIDER = process.env.EMAIL_PROVIDER || 'console'; // 'sendgrid', 'resend', or 'console'
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@poweredbyape.ai';

/**
 * Send an email using the configured provider
 */
export async function sendEmail(params: EmailParams): Promise<EmailResult> {
  const { to, subject, html, text, from = EMAIL_FROM, replyTo } = params;

  // Choose provider based on configuration
  switch (EMAIL_PROVIDER) {
    case 'sendgrid':
      return sendViaSendGrid({ to, subject, html, text, from, replyTo });
    case 'resend':
      return sendViaResend({ to, subject, html, text, from, replyTo });
    default:
      return sendViaConsole({ to, subject, html, text, from, replyTo });
  }
}

// ==================== SENDGRID ====================

async function sendViaSendGrid(params: EmailParams): Promise<EmailResult> {
  if (!SENDGRID_API_KEY) {
    console.warn('SendGrid API key not configured, falling back to console');
    return sendViaConsole(params);
  }

  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: params.to }] }],
        from: { email: params.from },
        reply_to: params.replyTo ? { email: params.replyTo } : undefined,
        subject: params.subject,
        content: [
          ...(params.text ? [{ type: 'text/plain', value: params.text }] : []),
          { type: 'text/html', value: params.html },
        ],
      }),
    });

    if (response.ok || response.status === 202) {
      const messageId = response.headers.get('X-Message-Id') || `sg-${Date.now()}`;
      console.log(`✅ Email sent via SendGrid to ${params.to}: ${params.subject}`);
      return { success: true, messageId };
    } else {
      const error = await response.text();
      console.error('SendGrid error:', error);
      return { success: false, error: `SendGrid error: ${response.status}` };
    }
  } catch (error) {
    console.error('SendGrid error:', error);
    return { success: false, error: String(error) };
  }
}

// ==================== RESEND ====================

async function sendViaResend(params: EmailParams): Promise<EmailResult> {
  if (!RESEND_API_KEY) {
    console.warn('Resend API key not configured, falling back to console');
    return sendViaConsole(params);
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: params.from,
        to: params.to,
        reply_to: params.replyTo,
        subject: params.subject,
        html: params.html,
        text: params.text,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Email sent via Resend to ${params.to}: ${params.subject}`);
      return { success: true, messageId: data.id };
    } else {
      const error = await response.json();
      console.error('Resend error:', error);
      return { success: false, error: error.message || 'Resend error' };
    }
  } catch (error) {
    console.error('Resend error:', error);
    return { success: false, error: String(error) };
  }
}

// ==================== CONSOLE (Development) ====================

async function sendViaConsole(params: EmailParams): Promise<EmailResult> {
  console.log('\n' + '='.repeat(60));
  console.log('📧 EMAIL (Console - Development Mode)');
  console.log('='.repeat(60));
  console.log(`To: ${params.to}`);
  console.log(`From: ${params.from}`);
  if (params.replyTo) console.log(`Reply-To: ${params.replyTo}`);
  console.log(`Subject: ${params.subject}`);
  console.log('-'.repeat(60));
  console.log('Text Content:');
  console.log(params.text || '(HTML only)');
  console.log('='.repeat(60) + '\n');

  return { 
    success: true, 
    messageId: `console-${Date.now()}` 
  };
}

// ==================== BATCH SENDING ====================

/**
 * Send multiple emails (for notifications to multiple recipients)
 */
export async function sendBulkEmails(
  emails: EmailParams[]
): Promise<{ successful: number; failed: number; results: EmailResult[] }> {
  const results: EmailResult[] = [];
  let successful = 0;
  let failed = 0;

  for (const email of emails) {
    const result = await sendEmail(email);
    results.push(result);
    if (result.success) {
      successful++;
    } else {
      failed++;
    }
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return { successful, failed, results };
}

// ==================== EMAIL VERIFICATION ====================

/**
 * Basic email validation
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
