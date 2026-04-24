type Item = {
  productName: string;
  variantColorName: string;
  variantSku: string;
  quantity: number;
  priceCents: number;
  currency: string;
};

type Opts = {
  displayName: string | null;
  orderId: string;
  orderDate: string;
  items: Item[];
  totalCents: number;
  currency: string;
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  postalCode: string;
  country: string;
  orderUrl: string;
};

export function orderConfirmationTemplate(opts: Opts) {
  const subject = `Order confirmed — #${opts.orderId.slice(0, 8).toUpperCase()}`;

  const itemsHtml = opts.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0;">
          <strong>${item.productName}</strong><br/>
          <span style="color: #666; font-size: 13px;">${item.variantColorName} · ${item.variantSku}</span>
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; text-align: center; color: #666;">
          ×${item.quantity}
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; text-align: right; font-weight: 600;">
          ${((item.priceCents * item.quantity) / 100).toFixed(2)} ${item.currency}
        </td>
      </tr>`,
    )
    .join('');

  const itemsText = opts.items
    .map(
      (item) =>
        `- ${item.productName} (${item.variantColorName}) ×${item.quantity} — ${((item.priceCents * item.quantity) / 100).toFixed(2)} ${item.currency}`,
    )
    .join('\n');

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#f9f9f9;font-family:sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f9f9;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;">
        <!-- Header -->
        <tr>
          <td style="background:#0d9488;padding:32px 40px;">
            <h1 style="margin:0;color:#fff;font-size:24px;letter-spacing:-0.5px;">HearHouse</h1>
            <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">Order confirmed ✓</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:40px;">
            <p style="margin:0 0 24px;font-size:16px;color:#111;">
              Hi ${opts.displayName ?? opts.firstName},<br/>
              Thank you for your order! We've received it and will process it shortly.
            </p>

            <p style="margin:0 0 8px;font-size:13px;color:#666;text-transform:uppercase;letter-spacing:0.5px;">
              Order #${opts.orderId.slice(0, 8).toUpperCase()} · ${opts.orderDate}
            </p>

            <!-- Items -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
              ${itemsHtml}
              <tr>
                <td colspan="2" style="padding:16px 0 0;font-weight:600;font-size:15px;">Total</td>
                <td style="padding:16px 0 0;text-align:right;font-weight:700;font-size:18px;color:#0d9488;">
                  ${(opts.totalCents / 100).toFixed(2)} ${opts.currency}
                </td>
              </tr>
            </table>

            <!-- Shipping -->
            <div style="background:#f9f9f9;border-radius:8px;padding:16px 20px;margin-bottom:32px;">
              <p style="margin:0 0 8px;font-size:13px;color:#666;text-transform:uppercase;letter-spacing:0.5px;">Shipping address</p>
              <p style="margin:0;font-size:14px;color:#111;line-height:1.6;">
                ${opts.firstName} ${opts.lastName}<br/>
                ${opts.addressLine1}${opts.addressLine2 ? '<br/>' + opts.addressLine2 : ''}<br/>
                ${opts.postalCode} ${opts.city}<br/>
                ${opts.country}
              </p>
            </div>

            <a href="${opts.orderUrl}" style="display:inline-block;background:#0d9488;color:#fff;text-decoration:none;padding:14px 28px;border-radius:8px;font-weight:600;font-size:15px;">
              View order
            </a>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:24px 40px;border-top:1px solid #f0f0f0;">
            <p style="margin:0;font-size:12px;color:#999;text-align:center;">
              HearHouse · Questions? Reply to this email.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const text = `
Order confirmed — #${opts.orderId.slice(0, 8).toUpperCase()}

Hi ${opts.displayName ?? opts.firstName},
Thank you for your order!

Items:
${itemsText}

Total: ${(opts.totalCents / 100).toFixed(2)} ${opts.currency}

Shipping:
${opts.firstName} ${opts.lastName}
${opts.addressLine1}${opts.addressLine2 ? '\n' + opts.addressLine2 : ''}
${opts.postalCode} ${opts.city}
${opts.country}

View order: ${opts.orderUrl}
`;

  return { subject, html, text };
}
