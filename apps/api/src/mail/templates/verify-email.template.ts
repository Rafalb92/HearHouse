type VerifyEmailProps = {
  displayName: string | null;
  verifyUrl: string;
};

export function verifyEmailTemplate({
  displayName,
  verifyUrl,
}: VerifyEmailProps): { subject: string; html: string; text: string } {
  const name = displayName ?? 'there';

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Verify your email</title>
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
                Welcome to HearHouse! Please verify your email address to activate your account.
              </p>

              <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
                <tr>
                  <td style="background:#0f172a;border-radius:8px;">
                    <a href="${verifyUrl}"
                       style="display:inline-block;padding:12px 28px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;">
                      Verify email
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 24px;font-size:13px;color:#94a3b8;line-height:1.6;">
                If you didn't create a HearHouse account, you can safely ignore this email.
              </p>

              <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />

              <p style="margin:0;font-size:12px;color:#cbd5e1;">
                If the button doesn't work, copy and paste this link into your browser:<br />
                <a href="${verifyUrl}" style="color:#64748b;word-break:break-all;">${verifyUrl}</a>
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

Welcome to HearHouse! Please verify your email address:

${verifyUrl}

If you didn't create this account, ignore this email.
  `.trim();

  return { subject: 'Verify your HearHouse email', html, text };
}
