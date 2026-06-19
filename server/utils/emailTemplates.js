export const passwordResetTemplate = (resetUrl, userName) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset Your Password</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f5f7; font-family:'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f5f7; padding:40px 0;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 1px 4px rgba(0,0,0,0.05);">
          
         
          <tr>
            <td style="background-color:#2563eb; padding:32px; text-align:center;">
              <h1 style="margin:0; color:#ffffff; font-size:24px; font-weight:700; letter-spacing:-0.5px;">
                CollabFlow
              </h1>
            </td>
          </tr>

         
          <tr>
            <td style="padding:40px 32px;">
              <h2 style="margin:0 0 16px; color:#111827; font-size:20px; font-weight:600;">
                Reset your password
              </h2>
              <p style="margin:0 0 24px; color:#6b7280; font-size:15px; line-height:1.6;">
                Hi ${userName || 'there'}, we received a request to reset your password. Click the button below to choose a new one. This link will expire in <strong>15 minutes</strong>.
              </p>

              <!-- Button -->
              <table cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
                <tr>
                  <td style="border-radius:8px; background-color:#2563eb;">
                    <a href="${resetUrl}" target="_blank" style="display:inline-block; padding:14px 32px; color:#ffffff; font-size:15px; font-weight:600; text-decoration:none; border-radius:8px;">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 8px; color:#9ca3af; font-size:13px; line-height:1.6;">
                If the button doesn't work, copy and paste this link into your browser:
              </p>
              <p style="margin:0 0 24px; word-break:break-all;">
                <a href="${resetUrl}" style="color:#2563eb; font-size:13px;">${resetUrl}</a>
              </p>

              <div style="height:1px; background-color:#e5e7eb; margin:24px 0;"></div>

              <p style="margin:0; color:#9ca3af; font-size:13px; line-height:1.6;">
                If you didn't request a password reset, you can safely ignore this email — your password will remain unchanged.
              </p>
            </td>
          </tr>

        
          <tr>
            <td style="background-color:#f9fafb; padding:24px 32px; text-align:center;">
              <p style="margin:0; color:#9ca3af; font-size:12px;">
                © ${new Date().getFullYear()} CollabFlow. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
export const welcomeEmailTemplate = (userName) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="margin:0; padding:0; background-color:#f4f5f7; font-family:'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f5f7; padding:40px 0;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 1px 4px rgba(0,0,0,0.05);">
          <tr>
            <td style="background-color:#2563eb; padding:32px; text-align:center;">
              <h1 style="margin:0; color:#ffffff; font-size:24px; font-weight:700;">CollabFlow</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 32px;">
              <h2 style="margin:0 0 16px; color:#111827; font-size:20px; font-weight:600;">
                Welcome aboard, ${userName} 👋
              </h2>
              <p style="margin:0 0 24px; color:#6b7280; font-size:15px; line-height:1.6;">
                Your account has been created successfully. You're all set to start organizing projects, collaborating with your team, and getting things done.
              </p>
              <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td style="border-radius:8px; background-color:#2563eb;">
                    <a href="${process.env.CLIENT_URL}/dashboard" target="_blank" style="display:inline-block; padding:14px 32px; color:#ffffff; font-size:15px; font-weight:600; text-decoration:none; border-radius:8px;">
                      Go to Dashboard
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background-color:#f9fafb; padding:24px 32px; text-align:center;">
              <p style="margin:0; color:#9ca3af; font-size:12px;">
                © ${new Date().getFullYear()} CollabFlow. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
export const notificationTemplate = (senderName, message, taskTitle) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="margin:0; padding:0; background-color:#f4f5f7; font-family:'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f5f7; padding:40px 0;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 1px 4px rgba(0,0,0,0.05);">
          <tr>
            <td style="background-color:#2563eb; padding:32px; text-align:center;">
              <h1 style="margin:0; color:#ffffff; font-size:24px; font-weight:700;">CollabFlow</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 32px;">
              <h2 style="margin:0 0 16px; color:#111827; font-size:20px; font-weight:600;">
                ${senderName} ${message}
              </h2>
              ${taskTitle ? `<p style="margin:0 0 24px; color:#6b7280; font-size:15px; line-height:1.6;">Task: <strong>${taskTitle}</strong></p>` : ''}
              <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td style="border-radius:8px; background-color:#2563eb;">
                    <a href="${process.env.CLIENT_URL}/dashboard" target="_blank" style="display:inline-block; padding:14px 32px; color:#ffffff; font-size:15px; font-weight:600; text-decoration:none; border-radius:8px;">
                      View in CollabFlow
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background-color:#f9fafb; padding:24px 32px; text-align:center;">
              <p style="margin:0; color:#9ca3af; font-size:12px;">
                © ${new Date().getFullYear()} CollabFlow. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;