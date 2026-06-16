import { Resend } from 'resend';

function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('RESEND_API_KEY not configured — emails will not be sent');
    return null;
  }
  return new Resend(apiKey);
}

const FROM_ADDRESS = process.env.RESEND_FROM_EMAIL || 'TERA <onboarding@resend.dev>';

export async function sendTaskNotificationEmail(
  email: string,
  taskName: string,
  success: boolean,
  details: { filesProcessed?: number; duration?: number; errorMessage?: string }
): Promise<boolean> {
  const resend = getResendClient();
  if (!resend) return false;

  const durationStr = details.duration ? `${details.duration}s` : null;
  const filesStr = details.filesProcessed ? `${details.filesProcessed} archivo(s)` : null;

  const subject = success
    ? `✅ Tarea completada: ${taskName}`
    : `❌ Tarea fallida: ${taskName}`;

  const body = success
    ? `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #16a34a;">Tarea completada con éxito</h2>
        <p>La tarea <strong>${taskName}</strong> finalizó correctamente.</p>
        ${filesStr ? `<p>Archivos procesados: <strong>${filesStr}</strong></p>` : ''}
        ${durationStr ? `<p>Duración: <strong>${durationStr}</strong></p>` : ''}
        <p style="color: #6b7280; font-size: 13px;">TERA — transferencia automática de archivos.</p>
      </div>`
    : `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #dc2626;">Error en la tarea programada</h2>
        <p>La tarea <strong>${taskName}</strong> no pudo completarse.</p>
        ${details.errorMessage ? `<p>Error: <em>${details.errorMessage}</em></p>` : ''}
        <p>Revisá tu configuración en <a href="https://tera.app/scheduled-tasks">TERA</a>.</p>
        <p style="color: #6b7280; font-size: 13px;">TERA — transferencia automática de archivos.</p>
      </div>`;

  try {
    await resend.emails.send({ from: FROM_ADDRESS, to: email, subject, html: body });
    return true;
  } catch (error) {
    console.error('Failed to send task notification email:', error);
    return false;
  }
}

export async function sendPasswordResetEmail(email: string, resetLink: string): Promise<boolean> {
  const resend = getResendClient();
  if (!resend) return false;

  try {
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: email,
      subject: 'Restablecé tu contraseña de TERA',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #1d4ed8;">Restablecer contraseña</h2>
          <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta de TERA.</p>
          <p>
            <a href="${resetLink}" style="display: inline-block; background: #2563eb; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600;">
              Restablecer contraseña
            </a>
          </p>
          <p style="color: #6b7280; font-size: 13px;">Este enlace vence en 1 hora. Si no solicitaste este cambio, podés ignorar este correo.</p>
        </div>
      `,
    });
    return true;
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    return false;
  }
}
