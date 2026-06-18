import { Resend } from 'resend';

function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('RESEND_API_KEY not configured — emails will not be sent');
    return null;
  }
  return new Resend(apiKey);
}

const FROM = process.env.RESEND_FROM_EMAIL || 'TERA <onboarding@resend.dev>';
const APP_URL = process.env.APP_URL || 'https://mytera.app';

// ── Shared layout ─────────────────────────────────────────────────────────────

function layout(content: string, previewText = ''): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="x-apple-disable-message-reformatting" />
  <title>TERA</title>
  ${previewText ? `<span style="display:none;max-height:0;overflow:hidden;">${previewText}&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌</span>` : ''}
</head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;">

          <!-- Header -->
          <tr>
            <td style="padding-bottom:24px;" align="center">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#0061D5;border-radius:12px;padding:10px 20px;">
                    <span style="font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;text-decoration:none;">TERA</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#ffffff;border-radius:16px;box-shadow:0 2px 8px rgba(0,0,0,0.08);overflow:hidden;">
              <!-- Blue top bar -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr><td style="background:linear-gradient(90deg,#0061D5,#2563eb);height:4px;"></td></tr>
              </table>
              <!-- Content -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr><td style="padding:40px 40px 32px;">
                  ${content}
                </td></tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top:28px;" align="center">
              <p style="margin:0 0 8px;font-size:12px;color:#94a3b8;">
                © 2025 TERA · <a href="${APP_URL}" style="color:#0061D5;text-decoration:none;">mytera.app</a>
              </p>
              <p style="margin:0;font-size:11px;color:#b0bec5;">
                Transferencia inteligente de archivos entre nubes.
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

function btn(text: string, href: string, color = '#0061D5'): string {
  return `<table cellpadding="0" cellspacing="0" style="margin:28px 0;">
    <tr>
      <td style="background:${color};border-radius:10px;">
        <a href="${href}" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;letter-spacing:0.2px;">${text}</a>
      </td>
    </tr>
  </table>`;
}

function codeBlock(code: string): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0;">
    <tr>
      <td align="center" style="background:#f0f4f8;border-radius:12px;padding:24px;">
        <span style="font-size:38px;font-weight:800;letter-spacing:12px;color:#0f172a;font-family:'Courier New',monospace;">${code}</span>
      </td>
    </tr>
  </table>`;
}

function divider(): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
    <tr><td style="border-top:1px solid #e2e8f0;height:1px;"></td></tr>
  </table>`;
}

function heading(text: string): string {
  return `<h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#0f172a;letter-spacing:-0.5px;">${text}</h1>`;
}

function subheading(text: string): string {
  return `<p style="margin:0 0 20px;font-size:15px;color:#64748b;line-height:1.6;">${text}</p>`;
}

function p(text: string): string {
  return `<p style="margin:0 0 16px;font-size:15px;color:#334155;line-height:1.7;">${text}</p>`;
}

function note(text: string): string {
  return `<p style="margin:20px 0 0;font-size:12px;color:#94a3b8;line-height:1.6;">${text}</p>`;
}

function badge(text: string, color: string, bg: string): string {
  return `<span style="display:inline-block;background:${bg};color:${color};font-size:11px;font-weight:700;padding:4px 10px;border-radius:20px;letter-spacing:0.5px;text-transform:uppercase;">${text}</span>`;
}

// ── 1. Bienvenida ─────────────────────────────────────────────────────────────

export async function sendWelcomeEmail(email: string, firstName?: string): Promise<boolean> {
  const resend = getResendClient();
  if (!resend) return false;

  const name = firstName || 'ahí';
  const html = layout(`
    ${heading(`¡Bienvenido a TERA, ${name}! 🎉`)}
    ${subheading('Tu plataforma de transferencia inteligente entre nubes ya está lista.')}
    ${divider()}
    ${p('Con TERA podés:')}
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;">
      ${[
        ['🔗', 'Conectar Google Drive, Dropbox, OneDrive, Box y Amazon S3'],
        ['⚡', 'Transferir archivos entre nubes en segundos'],
        ['🗓️', 'Programar tareas automáticas de sincronización'],
        ['🔒', 'Todo encriptado y seguro'],
      ].map(([icon, text]) => `
        <tr>
          <td style="padding:8px 0;">
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="font-size:18px;width:32px;vertical-align:top;">${icon}</td>
                <td style="font-size:14px;color:#334155;line-height:1.5;vertical-align:top;">${text}</td>
              </tr>
            </table>
          </td>
        </tr>`).join('')}
    </table>
    ${btn('Ir a mi cuenta →', `${APP_URL}/home`)}
    ${divider()}
    ${note('Si tenés alguna duda, respondé este email y te ayudamos. — El equipo de TERA')}
  `, `¡Bienvenido a TERA, ${name}!`);

  try {
    await resend.emails.send({ from: FROM, to: email, subject: `¡Bienvenido a TERA, ${name}! 🎉`, html });
    return true;
  } catch (err) {
    console.error('sendWelcomeEmail error:', err);
    return false;
  }
}

// ── 2. Confirmación de email ──────────────────────────────────────────────────

export async function sendEmailConfirmationEmail(email: string, confirmLink: string): Promise<boolean> {
  const resend = getResendClient();
  if (!resend) return false;

  const html = layout(`
    ${heading('Confirmá tu dirección de email')}
    ${subheading('Estás a un paso de comenzar a usar TERA. Confirmá tu email para activar tu cuenta.')}
    ${divider()}
    ${p('Hacé click en el botón de abajo para verificar tu dirección de email y activar tu cuenta.')}
    ${btn('Confirmar mi email', confirmLink)}
    ${divider()}
    ${note('Este enlace vence en 24 horas. Si no creaste una cuenta en TERA, podés ignorar este correo de forma segura.')}
    ${note(`Si el botón no funciona, copiá este enlace en tu navegador:<br/><span style="color:#0061D5;word-break:break-all;">${confirmLink}</span>`)}
  `, 'Confirmá tu dirección de email para activar tu cuenta TERA');

  try {
    await resend.emails.send({ from: FROM, to: email, subject: 'Confirmá tu email — TERA', html });
    return true;
  } catch (err) {
    console.error('sendEmailConfirmationEmail error:', err);
    return false;
  }
}

// ── 3. Recuperar contraseña ───────────────────────────────────────────────────

export async function sendPasswordResetEmail(email: string, resetLink: string): Promise<boolean> {
  const resend = getResendClient();
  if (!resend) return false;

  const html = layout(`
    ${heading('Restablecer contraseña')}
    ${subheading('Recibimos una solicitud para cambiar la contraseña de tu cuenta de TERA.')}
    ${divider()}
    ${p('Hacé click en el botón de abajo para crear una nueva contraseña. Si no solicitaste este cambio, podés ignorar este email — tu contraseña actual sigue siendo la misma.')}
    ${btn('Restablecer mi contraseña', resetLink, '#dc2626')}
    ${divider()}
    ${note('⚠️ Este enlace vence en 1 hora por seguridad.')}
    ${note(`Si el botón no funciona, copiá este enlace:<br/><span style="color:#0061D5;word-break:break-all;">${resetLink}</span>`)}
  `, 'Restablecé tu contraseña de TERA');

  try {
    await resend.emails.send({ from: FROM, to: email, subject: 'Restablecé tu contraseña — TERA', html });
    return true;
  } catch (err) {
    console.error('sendPasswordResetEmail error:', err);
    return false;
  }
}

// ── 4. Código de verificación ─────────────────────────────────────────────────

export async function sendVerificationCodeEmail(email: string, code: string, expiresInMinutes = 10): Promise<boolean> {
  const resend = getResendClient();
  if (!resend) return false;

  const html = layout(`
    ${heading('Tu código de verificación')}
    ${subheading(`Ingresá este código en TERA para continuar. Vence en ${expiresInMinutes} minutos.`)}
    ${divider()}
    ${codeBlock(code)}
    ${divider()}
    ${note(`Por seguridad, este código expira en ${expiresInMinutes} minutos. Si no solicitaste este código, ignorá este mensaje.`)}
    ${note('Nunca te pediremos este código por teléfono o por otro canal. — Equipo TERA')}
  `, `Tu código de verificación TERA: ${code}`);

  try {
    await resend.emails.send({ from: FROM, to: email, subject: `${code} es tu código de TERA`, html });
    return true;
  } catch (err) {
    console.error('sendVerificationCodeEmail error:', err);
    return false;
  }
}

// ── 5. Cambio de email ────────────────────────────────────────────────────────

export async function sendEmailChangeEmail(
  newEmail: string,
  oldEmail: string,
  confirmLink: string
): Promise<boolean> {
  const resend = getResendClient();
  if (!resend) return false;

  const html = layout(`
    ${heading('Confirmá tu nuevo email')}
    ${subheading('Solicitaste cambiar la dirección de email de tu cuenta de TERA.')}
    ${divider()}
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;background:#f8fafc;border-radius:10px;">
      <tr>
        <td style="padding:16px 20px;">
          <p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">Cambio de email</p>
          <table cellpadding="0" cellspacing="0">
            <tr>
              <td style="font-size:13px;color:#94a3b8;width:80px;">Anterior:</td>
              <td style="font-size:13px;color:#334155;">${oldEmail}</td>
            </tr>
            <tr style="height:6px;"></tr>
            <tr>
              <td style="font-size:13px;color:#94a3b8;width:80px;">Nuevo:</td>
              <td style="font-size:14px;font-weight:700;color:#0061D5;">${newEmail}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    ${p('Hacé click para confirmar que querés usar este nuevo email en tu cuenta.')}
    ${btn('Confirmar nuevo email', confirmLink)}
    ${divider()}
    ${note('⚠️ Si no solicitaste este cambio, ignorá este mensaje. Tu email actual seguirá siendo el mismo.')}
    ${note('Este enlace vence en 24 horas.')}
  `, 'Confirmá el cambio de email en TERA');

  try {
    await resend.emails.send({ from: FROM, to: newEmail, subject: 'Confirmá tu nuevo email — TERA', html });
    return true;
  } catch (err) {
    console.error('sendEmailChangeEmail error:', err);
    return false;
  }
}

// ── 6. Notificación de tarea ──────────────────────────────────────────────────

export async function sendTaskNotificationEmail(
  email: string,
  taskName: string,
  success: boolean,
  details: { filesProcessed?: number; duration?: number; errorMessage?: string }
): Promise<boolean> {
  const resend = getResendClient();
  if (!resend) return false;

  const durationStr = details.duration ? `${details.duration}s` : null;
  const filesStr = details.filesProcessed !== undefined ? `${details.filesProcessed} archivo(s)` : null;

  const html = success
    ? layout(`
        <table cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
          <tr><td>${badge('Completada', '#16a34a', '#dcfce7')}</td></tr>
        </table>
        ${heading('Tarea completada con éxito ✅')}
        ${subheading(`La tarea <strong>${taskName}</strong> finalizó correctamente.`)}
        ${divider()}
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:10px;margin-bottom:24px;">
          <tr><td style="padding:20px;">
            ${filesStr ? `<p style="margin:0 0 10px;font-size:14px;color:#334155;"><span style="color:#64748b;">Archivos procesados:</span> <strong>${filesStr}</strong></p>` : ''}
            ${durationStr ? `<p style="margin:0;font-size:14px;color:#334155;"><span style="color:#64748b;">Duración:</span> <strong>${durationStr}</strong></p>` : ''}
          </td></tr>
        </table>
        ${btn('Ver operaciones', `${APP_URL}/operations`, '#16a34a')}
        ${divider()}
        ${note('Esta notificación fue enviada porque tenés activadas las alertas de tareas en TERA.')}
      `, `Tarea completada: ${taskName}`)
    : layout(`
        <table cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
          <tr><td>${badge('Fallida', '#dc2626', '#fee2e2')}</td></tr>
        </table>
        ${heading('Error en la tarea programada ❌')}
        ${subheading(`La tarea <strong>${taskName}</strong> no pudo completarse.`)}
        ${divider()}
        ${details.errorMessage ? `
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#fef2f2;border-left:3px solid #dc2626;border-radius:0 8px 8px 0;margin-bottom:24px;">
            <tr><td style="padding:16px 20px;">
              <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#dc2626;text-transform:uppercase;letter-spacing:0.5px;">Error</p>
              <p style="margin:0;font-size:13px;color:#7f1d1d;font-family:monospace;">${details.errorMessage}</p>
            </td></tr>
          </table>` : ''}
        ${btn('Revisar configuración', `${APP_URL}/tasks`, '#dc2626')}
        ${divider()}
        ${note('Revisá la configuración de tu tarea o las conexiones de tus cuentas en Integraciones.')}
      `, `Tarea fallida: ${taskName}`);

  const subject = success ? `✅ Tarea completada: ${taskName}` : `❌ Tarea fallida: ${taskName}`;

  try {
    await resend.emails.send({ from: FROM, to: email, subject, html });
    return true;
  } catch (err) {
    console.error('sendTaskNotificationEmail error:', err);
    return false;
  }
}

// ── 7. Acceso anticipado ──────────────────────────────────────────────────────

export async function sendEarlyAccessEmail(email: string, firstName?: string): Promise<boolean> {
  const resend = getResendClient();
  if (!resend) return false;

  const name = firstName || 'ahí';
  const html = layout(`
    <table cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr><td>${badge('Acceso anticipado', '#7c3aed', '#ede9fe')}</td></tr>
    </table>
    ${heading(`¡Estás dentro, ${name}! 🚀`)}
    ${subheading('Sos parte del grupo de early adopters de TERA. Gracias por ser de los primeros.')}
    ${divider()}
    ${p('Tenés acceso anticipado a todas las funciones de TERA:')}
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
      ${[
        ['☁️', 'Google Drive, Dropbox, OneDrive, Box y Amazon S3'],
        ['⚡', 'Transferencias ilimitadas entre nubes'],
        ['🗓️', 'Tareas programadas automáticas'],
        ['📊', 'Analytics de tus transferencias'],
        ['🔐', 'Encriptación de extremo a extremo'],
      ].map(([icon, text]) => `
        <tr>
          <td style="padding:6px 0;">
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="font-size:16px;width:28px;vertical-align:top;">${icon}</td>
                <td style="font-size:14px;color:#334155;line-height:1.5;vertical-align:top;">${text}</td>
              </tr>
            </table>
          </td>
        </tr>`).join('')}
    </table>
    ${btn('Acceder a TERA ahora →', `${APP_URL}`, '#7c3aed')}
    ${divider()}
    ${p('Tu feedback es muy valioso para nosotros. Respondé este email con cualquier sugerencia, bug o idea — lo leemos todo.')}
    ${note('— Facundo y el equipo de TERA 🙌')}
  `, `¡Bienvenido al early access de TERA, ${name}!`);

  try {
    await resend.emails.send({ from: FROM, to: email, subject: `¡Acceso anticipado activado, ${name}! 🚀 — TERA`, html });
    return true;
  } catch (err) {
    console.error('sendEarlyAccessEmail error:', err);
    return false;
  }
}
