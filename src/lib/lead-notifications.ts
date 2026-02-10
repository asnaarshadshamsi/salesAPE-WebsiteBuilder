// Lead Notification System
// Sends automated emails and notifications when new leads come in

import { sendEmail, EmailResult } from './email-service';

export interface LeadData {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  message?: string | null;
  source?: string | null;
  variant?: string | null;
  createdAt: Date;
}

export interface BusinessData {
  name: string;
  email?: string | null;
  phone?: string | null;
  ownerEmail: string;
  siteUrl: string;
  calendlyUrl?: string | null;
}

// ==================== OWNER NOTIFICATIONS ====================

/**
 * Send email notification to business owner when new lead comes in
 */
export async function notifyOwnerOfNewLead(
  lead: LeadData,
  business: BusinessData
): Promise<EmailResult> {
  const subject = `🎉 New Lead: ${lead.name} - ${business.name}`;
  
  const html = generateOwnerNotificationHTML(lead, business);
  const text = generateOwnerNotificationText(lead, business);

  return sendEmail({
    to: business.ownerEmail,
    subject,
    html,
    text,
  });
}

function generateOwnerNotificationHTML(lead: LeadData, business: BusinessData): string {
  const leadTime = new Date(lead.createdAt).toLocaleString();
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Lead Notification</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0a0a0a;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #ec4899, #8b5cf6); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 24px;">🎉 New Lead Alert!</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Someone just contacted ${business.name}</p>
    </div>
    
    <!-- Body -->
    <div style="background-color: #18181b; padding: 30px; border-radius: 0 0 16px 16px;">
      <!-- Lead Info Card -->
      <div style="background-color: #27272a; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
        <h2 style="color: #ec4899; margin: 0 0 15px 0; font-size: 18px;">Contact Information</h2>
        
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #a1a1aa; width: 100px;">Name:</td>
            <td style="padding: 8px 0; color: white; font-weight: 600;">${lead.name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #a1a1aa;">Email:</td>
            <td style="padding: 8px 0;">
              <a href="mailto:${lead.email}" style="color: #ec4899; text-decoration: none;">${lead.email}</a>
            </td>
          </tr>
          ${lead.phone ? `
          <tr>
            <td style="padding: 8px 0; color: #a1a1aa;">Phone:</td>
            <td style="padding: 8px 0;">
              <a href="tel:${lead.phone}" style="color: #ec4899; text-decoration: none;">${lead.phone}</a>
            </td>
          </tr>
          ` : ''}
          <tr>
            <td style="padding: 8px 0; color: #a1a1aa;">Received:</td>
            <td style="padding: 8px 0; color: white;">${leadTime}</td>
          </tr>
          ${lead.source ? `
          <tr>
            <td style="padding: 8px 0; color: #a1a1aa;">Source:</td>
            <td style="padding: 8px 0; color: white;">${lead.source}</td>
          </tr>
          ` : ''}
        </table>
      </div>
      
      ${lead.message ? `
      <!-- Message -->
      <div style="background-color: #27272a; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
        <h2 style="color: #ec4899; margin: 0 0 15px 0; font-size: 18px;">Message</h2>
        <p style="color: #d4d4d8; margin: 0; line-height: 1.6;">${lead.message}</p>
      </div>
      ` : ''}
      
      <!-- Action Buttons -->
      <div style="text-align: center; margin-top: 25px;">
        <a href="mailto:${lead.email}?subject=Re: Your inquiry to ${business.name}" 
           style="display: inline-block; background: linear-gradient(135deg, #ec4899, #8b5cf6); color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 5px;">
          📧 Reply via Email
        </a>
        ${lead.phone ? `
        <a href="tel:${lead.phone}" 
           style="display: inline-block; background-color: #27272a; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 5px; border: 1px solid #3f3f46;">
          📞 Call Now
        </a>
        ` : ''}
      </div>
      
      <!-- Dashboard Link -->
      <div style="text-align: center; margin-top: 25px; padding-top: 20px; border-top: 1px solid #3f3f46;">
        <p style="color: #71717a; margin: 0 0 10px 0; font-size: 14px;">Manage all your leads in one place</p>
        <a href="${business.siteUrl}/dashboard/leads" 
           style="color: #ec4899; text-decoration: none; font-weight: 600;">
          View in Dashboard →
        </a>
      </div>
    </div>
    
    <!-- Footer -->
    <div style="text-align: center; padding: 20px; color: #71717a; font-size: 12px;">
      <p style="margin: 0;">Powered by HackSquad × APE AI</p>
      <p style="margin: 5px 0 0 0;">Instant Business Launcher</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

function generateOwnerNotificationText(lead: LeadData, business: BusinessData): string {
  const leadTime = new Date(lead.createdAt).toLocaleString();
  
  return `
🎉 NEW LEAD ALERT - ${business.name}

Contact Information:
- Name: ${lead.name}
- Email: ${lead.email}
${lead.phone ? `- Phone: ${lead.phone}` : ''}
- Received: ${leadTime}
${lead.source ? `- Source: ${lead.source}` : ''}

${lead.message ? `Message:\n${lead.message}\n` : ''}

---
Reply to this lead: mailto:${lead.email}
View all leads: ${business.siteUrl}/dashboard/leads

Powered by HackSquad × APE AI
  `.trim();
}

// ==================== LEAD AUTO-RESPONSE ====================

/**
 * Send automated response to lead (optional - can be enabled per business)
 */
export async function sendLeadAutoResponse(
  lead: LeadData,
  business: BusinessData
): Promise<EmailResult> {
  const subject = `Thanks for contacting ${business.name}!`;
  
  const html = generateLeadAutoResponseHTML(lead, business);
  const text = generateLeadAutoResponseText(lead, business);

  return sendEmail({
    to: lead.email,
    subject,
    html,
    text,
  });
}

function generateLeadAutoResponseHTML(lead: LeadData, business: BusinessData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thank You</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0a0a0a;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #ec4899, #8b5cf6); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 24px;">Thank You, ${lead.name}! 🙏</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">We've received your message</p>
    </div>
    
    <!-- Body -->
    <div style="background-color: #18181b; padding: 30px; border-radius: 0 0 16px 16px;">
      <p style="color: #d4d4d8; margin: 0 0 20px 0; line-height: 1.6;">
        Hi ${lead.name},
      </p>
      
      <p style="color: #d4d4d8; margin: 0 0 20px 0; line-height: 1.6;">
        Thank you for reaching out to <strong style="color: white;">${business.name}</strong>! 
        We've received your inquiry and will get back to you as soon as possible.
      </p>
      
      <p style="color: #d4d4d8; margin: 0 0 20px 0; line-height: 1.6;">
        In the meantime, here's what you can expect:
      </p>
      
      <ul style="color: #d4d4d8; margin: 0 0 20px 0; padding-left: 20px; line-height: 1.8;">
        <li>We typically respond within 24 hours</li>
        <li>Feel free to reply to this email with any additional questions</li>
        ${business.calendlyUrl ? `<li>You can also <a href="${business.calendlyUrl}" style="color: #ec4899;">schedule a call</a> directly</li>` : ''}
      </ul>
      
      ${business.calendlyUrl ? `
      <div style="text-align: center; margin: 30px 0;">
        <a href="${business.calendlyUrl}" 
           style="display: inline-block; background: linear-gradient(135deg, #ec4899, #8b5cf6); color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">
          📅 Book a Call
        </a>
      </div>
      ` : ''}
      
      <p style="color: #d4d4d8; margin: 20px 0 0 0; line-height: 1.6;">
        Best regards,<br>
        <strong style="color: white;">The ${business.name} Team</strong>
      </p>
    </div>
    
    <!-- Footer -->
    <div style="text-align: center; padding: 20px; color: #71717a; font-size: 12px;">
      <p style="margin: 0;">Powered by HackSquad × APE AI</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

function generateLeadAutoResponseText(lead: LeadData, business: BusinessData): string {
  return `
Hi ${lead.name},

Thank you for reaching out to ${business.name}! We've received your inquiry and will get back to you as soon as possible.

In the meantime, here's what you can expect:
- We typically respond within 24 hours
- Feel free to reply to this email with any additional questions
${business.calendlyUrl ? `- You can also schedule a call directly: ${business.calendlyUrl}` : ''}

Best regards,
The ${business.name} Team

---
Powered by HackSquad × APE AI
  `.trim();
}

// ==================== LEAD STATUS UPDATE NOTIFICATIONS ====================

/**
 * Send notification when lead status changes (e.g., meeting booked)
 */
export async function notifyLeadStatusChange(
  lead: LeadData,
  business: BusinessData,
  newStatus: string,
  notes?: string
): Promise<EmailResult | null> {
  // Only send certain status updates to the lead
  if (newStatus === 'BOOKED') {
    return sendMeetingBookedConfirmation(lead, business, notes);
  }
  
  // For other status changes, just notify the owner
  return null;
}

async function sendMeetingBookedConfirmation(
  lead: LeadData,
  business: BusinessData,
  meetingDetails?: string
): Promise<EmailResult> {
  const subject = `Meeting Confirmed with ${business.name}`;
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Meeting Confirmed</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0a0a0a;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #10b981, #06b6d4); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 24px;">✅ Meeting Confirmed!</h1>
    </div>
    
    <div style="background-color: #18181b; padding: 30px; border-radius: 0 0 16px 16px;">
      <p style="color: #d4d4d8; margin: 0 0 20px 0; line-height: 1.6;">
        Hi ${lead.name},
      </p>
      
      <p style="color: #d4d4d8; margin: 0 0 20px 0; line-height: 1.6;">
        Great news! Your meeting with <strong style="color: white;">${business.name}</strong> has been confirmed.
      </p>
      
      ${meetingDetails ? `
      <div style="background-color: #27272a; border-radius: 12px; padding: 20px; margin: 20px 0;">
        <h3 style="color: #10b981; margin: 0 0 10px 0;">Meeting Details</h3>
        <p style="color: #d4d4d8; margin: 0; white-space: pre-line;">${meetingDetails}</p>
      </div>
      ` : ''}
      
      <p style="color: #d4d4d8; margin: 20px 0 0 0; line-height: 1.6;">
        We look forward to speaking with you!<br><br>
        Best regards,<br>
        <strong style="color: white;">The ${business.name} Team</strong>
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();

  return sendEmail({
    to: lead.email,
    subject,
    html,
    text: `Meeting Confirmed with ${business.name}\n\nHi ${lead.name},\n\nYour meeting has been confirmed.${meetingDetails ? `\n\nDetails:\n${meetingDetails}` : ''}\n\nWe look forward to speaking with you!\n\nBest regards,\nThe ${business.name} Team`,
  });
}
