// Email utility for sending order confirmations and notifications
// In production, replace with a real email service like SendGrid, Resend, or AWS SES

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

interface ShippingAddress {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface OrderConfirmationEmailParams {
  to: string;
  customerName: string;
  orderId: string;
  items: OrderItem[];
  total: number;
  businessName: string;
  shippingAddress: ShippingAddress;
}

interface BusinessNotificationEmailParams {
  to: string;
  orderId: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  items: OrderItem[];
  total: number;
  shippingAddress: ShippingAddress;
  notes?: string;
}

// Generate HTML email template for order confirmation
function generateOrderConfirmationHTML({
  customerName,
  orderId,
  items,
  total,
  businessName,
  shippingAddress,
}: Omit<OrderConfirmationEmailParams, "to">): string {
  const itemsHTML = items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">
          <strong>${item.name}</strong>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">
          ${item.quantity}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">
          $${(item.price * item.quantity).toFixed(2)}
        </td>
      </tr>
    `
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Order Confirmed! 🎉</h1>
      </div>
      
      <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 16px 16px;">
        <p style="font-size: 16px;">Hi ${customerName},</p>
        <p style="font-size: 16px;">Thank you for your order from <strong>${businessName}</strong>! We've received your order and are getting it ready.</p>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 12px; margin: 20px 0;">
          <p style="margin: 0; color: #64748b; font-size: 14px;">Order ID</p>
          <p style="margin: 5px 0 0 0; font-size: 20px; font-weight: bold; color: #6366f1;">${orderId}</p>
        </div>
        
        <h2 style="font-size: 18px; margin-top: 30px;">Order Details</h2>
        <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
          <thead>
            <tr style="background: #f8fafc;">
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb;">Item</th>
              <th style="padding: 12px; text-align: center; border-bottom: 2px solid #e5e7eb;">Qty</th>
              <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="padding: 15px 12px; font-weight: bold; font-size: 18px;">Total</td>
              <td style="padding: 15px 12px; text-align: right; font-weight: bold; font-size: 18px; color: #6366f1;">$${total.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
        
        <h2 style="font-size: 18px; margin-top: 30px;">Shipping Address</h2>
        <div style="background: #f8fafc; padding: 15px; border-radius: 8px;">
          <p style="margin: 0;">${shippingAddress.address}</p>
          <p style="margin: 5px 0 0 0;">${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zipCode}</p>
          <p style="margin: 5px 0 0 0;">${shippingAddress.country}</p>
        </div>
        
        <div style="margin-top: 30px; padding: 20px; background: #f0fdf4; border-radius: 12px; text-align: center;">
          <p style="margin: 0; color: #166534; font-size: 14px;">
            ✅ You'll receive tracking information once your order ships.
          </p>
        </div>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        
        <p style="color: #64748b; font-size: 14px; text-align: center;">
          Questions about your order? Reply to this email or contact ${businessName}.
        </p>
        
        <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 20px;">
          Powered by HackSquad 🚀
        </p>
      </div>
    </body>
    </html>
  `;
}

// Generate HTML email template for business notification
function generateBusinessNotificationHTML({
  orderId,
  customer,
  items,
  total,
  shippingAddress,
  notes,
}: Omit<BusinessNotificationEmailParams, "to">): string {
  const itemsHTML = items
    .map(
      (item) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Order Received</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #22c55e; padding: 20px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">💰 New Order Received!</h1>
      </div>
      
      <div style="background: white; padding: 25px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
        <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <p style="margin: 0; font-weight: bold; color: #92400e;">Order ID: ${orderId}</p>
          <p style="margin: 5px 0 0 0; font-size: 24px; font-weight: bold; color: #166534;">$${total.toFixed(2)}</p>
        </div>
        
        <h3 style="margin-bottom: 10px;">Customer Information</h3>
        <table style="width: 100%; margin-bottom: 20px;">
          <tr>
            <td style="padding: 5px 0; color: #64748b;">Name:</td>
            <td style="padding: 5px 0; font-weight: bold;">${customer.name}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0; color: #64748b;">Email:</td>
            <td style="padding: 5px 0;"><a href="mailto:${customer.email}">${customer.email}</a></td>
          </tr>
          <tr>
            <td style="padding: 5px 0; color: #64748b;">Phone:</td>
            <td style="padding: 5px 0;"><a href="tel:${customer.phone}">${customer.phone}</a></td>
          </tr>
        </table>
        
        <h3 style="margin-bottom: 10px;">Order Items</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background: #f8fafc;">
              <th style="padding: 10px; text-align: left;">Item</th>
              <th style="padding: 10px; text-align: center;">Qty</th>
              <th style="padding: 10px; text-align: right;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
          </tbody>
        </table>
        
        <h3 style="margin-bottom: 10px;">Shipping Address</h3>
        <div style="background: #f8fafc; padding: 12px; border-radius: 8px; margin-bottom: 20px;">
          <p style="margin: 0;">${shippingAddress.address}</p>
          <p style="margin: 3px 0 0 0;">${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zipCode}</p>
          <p style="margin: 3px 0 0 0;">${shippingAddress.country}</p>
        </div>
        
        ${notes ? `
        <h3 style="margin-bottom: 10px;">Customer Notes</h3>
        <div style="background: #fffbeb; padding: 12px; border-radius: 8px; border-left: 4px solid #f59e0b;">
          <p style="margin: 0; font-style: italic;">${notes}</p>
        </div>
        ` : ""}
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 25px 0;">
        
        <p style="color: #64748b; font-size: 13px; text-align: center;">
          View and manage this order in your HackSquad dashboard.
        </p>
      </div>
    </body>
    </html>
  `;
}

// Send order confirmation email to customer
export async function sendOrderConfirmationEmail(
  params: OrderConfirmationEmailParams
): Promise<boolean> {
  const html = generateOrderConfirmationHTML(params);

  // In development/MVP, log the email
  if (process.env.NODE_ENV === "development" || !process.env.EMAIL_API_KEY) {
    console.log("📧 ORDER CONFIRMATION EMAIL");
    console.log("To:", params.to);
    console.log("Subject:", `Order Confirmed - ${params.orderId}`);
    console.log("---");
    // In dev, you might want to save to file or database
    return true;
  }

  // Production: Send via email service
  // Example with Resend (https://resend.com - has free tier)
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.EMAIL_API_KEY}`,
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || "orders@hacksquad.dev",
        to: params.to,
        subject: `Order Confirmed - ${params.orderId}`,
        html,
      }),
    });

    if (!response.ok) {
      console.error("Failed to send email:", await response.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error("Email send error:", error);
    return false;
  }
}

// Send order notification to business owner
export async function sendOrderNotificationToBusinessEmail(
  params: BusinessNotificationEmailParams
): Promise<boolean> {
  const html = generateBusinessNotificationHTML(params);

  // In development/MVP, log the email
  if (process.env.NODE_ENV === "development" || !process.env.EMAIL_API_KEY) {
    console.log("📧 BUSINESS NOTIFICATION EMAIL");
    console.log("To:", params.to);
    console.log("Subject:", `🛒 New Order #${params.orderId} - $${params.total.toFixed(2)}`);
    console.log("---");
    return true;
  }

  // Production: Send via email service
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.EMAIL_API_KEY}`,
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || "orders@hacksquad.dev",
        to: params.to,
        subject: `🛒 New Order #${params.orderId} - $${params.total.toFixed(2)}`,
        html,
      }),
    });

    if (!response.ok) {
      console.error("Failed to send business notification:", await response.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error("Business notification error:", error);
    return false;
  }
}

// Generate plain text version (for email clients that don't support HTML)
export function generatePlainTextOrderConfirmation(
  params: Omit<OrderConfirmationEmailParams, "to">
): string {
  const itemsList = params.items
    .map((item) => `- ${item.name} x${item.quantity}: $${(item.price * item.quantity).toFixed(2)}`)
    .join("\n");

  return `
ORDER CONFIRMED! 🎉

Hi ${params.customerName},

Thank you for your order from ${params.businessName}!

Order ID: ${params.orderId}

ORDER DETAILS:
${itemsList}

TOTAL: $${params.total.toFixed(2)}

SHIPPING ADDRESS:
${params.shippingAddress.address}
${params.shippingAddress.city}, ${params.shippingAddress.state} ${params.shippingAddress.zipCode}
${params.shippingAddress.country}

You'll receive tracking information once your order ships.

Questions? Reply to this email or contact ${params.businessName}.

---
Powered by HackSquad 🚀
  `.trim();
}
