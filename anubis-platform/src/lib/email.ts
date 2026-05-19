import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.RESEND_FROM_EMAIL!;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL!;

type EmailPayload = {
  to: string;
  userName: string;
  type: string;
  title: string;
  message: string;
  data: Record<string, string> | null;
};

function getCta(type: string, data: Record<string, string> | null) {
  if (!data) return null;
  if (type === "location_match" && data.matched_gravesite_id)
    return { label: "View Nearby Memorial", url: `${APP_URL}/memorial/${data.matched_gravesite_id}` };
  if (type === "guestbook_entry" && data.gravesite_id)
    return { label: "View Guest Book", url: `${APP_URL}/dashboard/gravesite/${data.gravesite_id}` };
  if (type === "connection_request" || type === "connection_accepted")
    return { label: "View Connections", url: `${APP_URL}/dashboard/connections` };
  return null;
}

function buildHtml(userName: string, title: string, message: string, cta: { label: string; url: string } | null) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f4f1eb;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f1eb;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

          <!-- Header -->
          <tr>
            <td align="center" style="padding:0 0 24px;">
              <p style="margin:0;font-size:11px;letter-spacing:0.4em;color:#C9A84C;text-transform:uppercase;">
                ANUBIS Memorial Platform
              </p>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#ffffff;border:1px solid #e0d9cc;padding:40px 48px;">

              <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.3em;color:#9B8860;text-transform:uppercase;">
                Hello, ${userName}
              </p>

              <h1 style="margin:8px 0 24px;font-size:22px;font-weight:400;color:#1a1008;letter-spacing:0.02em;">
                ${title}
              </h1>

              <!-- Gold divider -->
              <table width="48" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr><td style="height:1px;background:#C9A84C;"></td></tr>
              </table>

              <p style="margin:0 0 32px;font-size:14px;line-height:1.7;color:#4a3f30;">
                ${message}
              </p>

              ${cta ? `
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#C9A84C;">
                    <a href="${cta.url}"
                       style="display:inline-block;padding:12px 28px;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#ffffff;text-decoration:none;font-family:Arial,sans-serif;font-weight:600;">
                      ${cta.label}
                    </a>
                  </td>
                </tr>
              </table>` : ""}

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding:24px 0 0;">
              <p style="margin:0;font-size:11px;color:#9B8860;line-height:1.6;">
                You received this because you have an ANUBIS account.<br/>
                <a href="${APP_URL}/dashboard/profile" style="color:#C9A84C;text-decoration:none;">
                  Manage your account
                </a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendNotificationEmail(payload: EmailPayload) {
  const cta = getCta(payload.type, payload.data);
  const html = buildHtml(payload.userName, payload.title, payload.message, cta);

  return resend.emails.send({
    from: FROM,
    to: payload.to,
    subject: `ANUBIS — ${payload.title}`,
    html,
  });
}
