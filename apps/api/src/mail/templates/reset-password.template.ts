type ResetPasswordProps = {
  displayName: string | null;
  resetUrl: string;
  expiresInHours: number;
};

export function resetPasswordTemplate({
  displayName,
  resetUrl,
  expiresInHours,
}: ResetPasswordProps): { subject: string; html: string; text: string } {
  const name = displayName ?? 'there';

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset your password</title>
</head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:12px;padding:48px 40px;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
          <tr>
            <td>
              <p style="margin:0 0 8px;font-size:24px;font-weight:700;color:#0f172a;">
                HearHouse
              </p>
              <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />

              <p style="margin:0 0 16px;font-size:16px;color:#0f172a;">
                Hi ${name},
              </p>
              <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.6;">
                We received a request to reset your password. Click the button below to choose a new one.
              </p>

              <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
                <tr>
                  <td style="background:#0f172a;border-radius:8px;">
                    <a href="${resetUrl}"
                       style="display:inline-block;padding:12px 28px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;">
                      Reset password
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 24px;font-size:13px;color:#94a3b8;line-height:1.6;">
                This link expires in <strong>${expiresInHours} hour${expiresInHours > 1 ? 's' : ''}</strong>.
                If you didn't request a password reset, you can safely ignore this email.
              </p>

              <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />

              <p style="margin:0;font-size:12px;color:#cbd5e1;">
                If the button doesn't work, copy and paste this link into your browser:<br />
                <a href="${resetUrl}" style="color:#64748b;word-break:break-all;">${resetUrl}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const text = `
Hi ${name},

We received a request to reset your HearHouse password.

Reset your password: ${resetUrl}

This link expires in ${expiresInHours} hour${expiresInHours > 1 ? 's' : ''}.

If you didn't request this, ignore this email.
  `.trim();

  return { subject: 'Reset your HearHouse password', html, text };
}
