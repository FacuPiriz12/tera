import { Resend } from 'resend';

export type EmailLang = 'es' | 'en' | 'pt';

function normLang(lang?: string): EmailLang {
  if (lang === 'en' || lang === 'pt') return lang;
  return 'es';
}

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

const TAGLINE: Record<EmailLang, string> = {
  es: 'Transferencia inteligente de archivos entre nubes.',
  en: 'Smart file transfer between clouds.',
  pt: 'Transferência inteligente de arquivos entre nuvens.',
};

function layout(content: string, previewText = '', lang: EmailLang = 'es'): string {
  return `<!DOCTYPE html>
<html lang="${lang}">
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
              <img src="${APP_URL}/logo-email.png" width="56" height="56" alt="TERA" style="display:block;border:0;border-radius:12px;" />
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
                ${TAGLINE[lang]}
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

function featureList(items: [string, string][]): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;">
      ${items.map(([icon, text]) => `
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
    </table>`;
}

// ── 1. Bienvenida ─────────────────────────────────────────────────────────────

export async function sendWelcomeEmail(email: string, firstName?: string, lang?: string): Promise<boolean> {
  const resend = getResendClient();
  if (!resend) return false;
  const l = normLang(lang);

  const fallbackName = { es: 'ahí', en: 'there', pt: 'aí' }[l];
  const name = firstName || fallbackName;

  const T = {
    es: {
      subject: `¡Bienvenido a TERA, ${name}! 🎉`,
      subheading: 'Tu plataforma de transferencia inteligente entre nubes ya está lista.',
      intro: 'Con TERA podés:',
      features: [
        ['🔗', 'Conectar Google Drive, Dropbox, OneDrive, Box y Amazon S3'],
        ['⚡', 'Transferir archivos entre nubes en segundos'],
        ['🗓️', 'Programar tareas automáticas de sincronización'],
        ['🔒', 'Todo encriptado y seguro'],
      ] as [string, string][],
      btn: 'Ir a mi cuenta →',
      note: 'Si tenés alguna duda, respondé este email y te ayudamos. — El equipo de TERA',
    },
    en: {
      subject: `Welcome to TERA, ${name}! 🎉`,
      subheading: 'Your smart cross-cloud transfer platform is ready.',
      intro: 'With TERA you can:',
      features: [
        ['🔗', 'Connect Google Drive, Dropbox, OneDrive, Box and Amazon S3'],
        ['⚡', 'Transfer files between clouds in seconds'],
        ['🗓️', 'Schedule automatic sync tasks'],
        ['🔒', 'Everything encrypted and secure'],
      ] as [string, string][],
      btn: 'Go to my account →',
      note: "If you have any questions, reply to this email and we'll help you. — The TERA team",
    },
    pt: {
      subject: `Bem-vindo à TERA, ${name}! 🎉`,
      subheading: 'Sua plataforma de transferência inteligente entre nuvens já está pronta.',
      intro: 'Com a TERA você pode:',
      features: [
        ['🔗', 'Conecte Google Drive, Dropbox, OneDrive, Box e Amazon S3'],
        ['⚡', 'Transfira arquivos entre nuvens em segundos'],
        ['🗓️', 'Agende tarefas automáticas de sincronização'],
        ['🔒', 'Tudo criptografado e seguro'],
      ] as [string, string][],
      btn: 'Ir para minha conta →',
      note: 'Se tiver alguma dúvida, responda este email e nós te ajudamos. — A equipe TERA',
    },
  }[l];

  const html = layout(`
    ${heading(T.subject)}
    ${subheading(T.subheading)}
    ${divider()}
    ${p(T.intro)}
    ${featureList(T.features)}
    ${btn(T.btn, `${APP_URL}/home`)}
    ${divider()}
    ${note(T.note)}
  `, T.subject, l);

  try {
    await resend.emails.send({ from: FROM, to: email, subject: T.subject, html });
    return true;
  } catch (err) {
    console.error('sendWelcomeEmail error:', err);
    return false;
  }
}

// ── 2. Confirmación de email ──────────────────────────────────────────────────

export async function sendEmailConfirmationEmail(email: string, confirmLink: string, lang?: string): Promise<boolean> {
  const resend = getResendClient();
  if (!resend) return false;
  const l = normLang(lang);

  const T = {
    es: {
      heading: 'Confirmá tu dirección de email',
      subheading: 'Estás a un paso de comenzar a usar TERA. Confirmá tu email para activar tu cuenta.',
      p: 'Hacé click en el botón de abajo para verificar tu dirección de email y activar tu cuenta.',
      btn: 'Confirmar mi email',
      note1: 'Este enlace vence en 24 horas. Si no creaste una cuenta en TERA, podés ignorar este correo de forma segura.',
      note2: 'Si el botón no funciona, copiá este enlace en tu navegador:',
      subject: 'Confirmá tu email — TERA',
      preview: 'Confirmá tu dirección de email para activar tu cuenta TERA',
    },
    en: {
      heading: 'Confirm your email address',
      subheading: "You're one step away from using TERA. Confirm your email to activate your account.",
      p: 'Click the button below to verify your email address and activate your account.',
      btn: 'Confirm my email',
      note1: 'This link expires in 24 hours. If you did not create a TERA account, you can safely ignore this email.',
      note2: "If the button doesn't work, copy this link into your browser:",
      subject: 'Confirm your email — TERA',
      preview: 'Confirm your email address to activate your TERA account',
    },
    pt: {
      heading: 'Confirme seu endereço de email',
      subheading: 'Você está a um passo de começar a usar a TERA. Confirme seu email para ativar sua conta.',
      p: 'Clique no botão abaixo para verificar seu endereço de email e ativar sua conta.',
      btn: 'Confirmar meu email',
      note1: 'Este link expira em 24 horas. Se você não criou uma conta na TERA, pode ignorar este email com segurança.',
      note2: 'Se o botão não funcionar, copie este link no seu navegador:',
      subject: 'Confirme seu email — TERA',
      preview: 'Confirme seu endereço de email para ativar sua conta TERA',
    },
  }[l];

  const html = layout(`
    ${heading(T.heading)}
    ${subheading(T.subheading)}
    ${divider()}
    ${p(T.p)}
    ${btn(T.btn, confirmLink)}
    ${divider()}
    ${note(T.note1)}
    ${note(`${T.note2}<br/><span style="color:#0061D5;word-break:break-all;">${confirmLink}</span>`)}
  `, T.preview, l);

  try {
    await resend.emails.send({ from: FROM, to: email, subject: T.subject, html });
    return true;
  } catch (err) {
    console.error('sendEmailConfirmationEmail error:', err);
    return false;
  }
}

// ── 3. Recuperar contraseña ───────────────────────────────────────────────────

export async function sendPasswordResetEmail(email: string, resetLink: string, lang?: string): Promise<boolean> {
  const resend = getResendClient();
  if (!resend) return false;
  const l = normLang(lang);

  const T = {
    es: {
      heading: 'Restablecer contraseña',
      subheading: 'Recibimos una solicitud para cambiar la contraseña de tu cuenta de TERA.',
      p: 'Hacé click en el botón de abajo para crear una nueva contraseña. Si no solicitaste este cambio, podés ignorar este email — tu contraseña actual sigue siendo la misma.',
      btn: 'Restablecer mi contraseña',
      note1: '⚠️ Este enlace vence en 1 hora por seguridad.',
      note2: 'Si el botón no funciona, copiá este enlace:',
      subject: 'Restablecé tu contraseña — TERA',
      preview: 'Restablecé tu contraseña de TERA',
    },
    en: {
      heading: 'Reset password',
      subheading: 'We received a request to change the password for your TERA account.',
      p: "Click the button below to create a new password. If you didn't request this change, you can ignore this email — your current password will remain the same.",
      btn: 'Reset my password',
      note1: '⚠️ This link expires in 1 hour for security.',
      note2: "If the button doesn't work, copy this link:",
      subject: 'Reset your password — TERA',
      preview: 'Reset your TERA password',
    },
    pt: {
      heading: 'Redefinir senha',
      subheading: 'Recebemos uma solicitação para alterar a senha da sua conta TERA.',
      p: 'Clique no botão abaixo para criar uma nova senha. Se você não solicitou essa alteração, pode ignorar este email — sua senha atual permanecerá a mesma.',
      btn: 'Redefinir minha senha',
      note1: '⚠️ Este link expira em 1 hora por segurança.',
      note2: 'Se o botão não funcionar, copie este link:',
      subject: 'Redefina sua senha — TERA',
      preview: 'Redefina sua senha da TERA',
    },
  }[l];

  const html = layout(`
    ${heading(T.heading)}
    ${subheading(T.subheading)}
    ${divider()}
    ${p(T.p)}
    ${btn(T.btn, resetLink, '#dc2626')}
    ${divider()}
    ${note(T.note1)}
    ${note(`${T.note2}<br/><span style="color:#0061D5;word-break:break-all;">${resetLink}</span>`)}
  `, T.preview, l);

  try {
    await resend.emails.send({ from: FROM, to: email, subject: T.subject, html });
    return true;
  } catch (err) {
    console.error('sendPasswordResetEmail error:', err);
    return false;
  }
}

// ── 4. Código de verificación ─────────────────────────────────────────────────

export async function sendVerificationCodeEmail(email: string, code: string, expiresInMinutes = 10, lang?: string): Promise<boolean> {
  const resend = getResendClient();
  if (!resend) return false;
  const l = normLang(lang);

  const T = {
    es: {
      heading: 'Tu código de verificación',
      subheading: `Ingresá este código en TERA para continuar. Vence en ${expiresInMinutes} minutos.`,
      note1: `Por seguridad, este código expira en ${expiresInMinutes} minutos. Si no solicitaste este código, ignorá este mensaje.`,
      note2: 'Nunca te pediremos este código por teléfono o por otro canal. — Equipo TERA',
      subject: `${code} es tu código de TERA`,
      preview: `Tu código de verificación TERA: ${code}`,
    },
    en: {
      heading: 'Your verification code',
      subheading: `Enter this code in TERA to continue. It expires in ${expiresInMinutes} minutes.`,
      note1: `For security, this code expires in ${expiresInMinutes} minutes. If you didn't request this code, ignore this message.`,
      note2: 'We will never ask you for this code by phone or any other channel. — The TERA team',
      subject: `${code} is your TERA code`,
      preview: `Your TERA verification code: ${code}`,
    },
    pt: {
      heading: 'Seu código de verificação',
      subheading: `Digite este código na TERA para continuar. Expira em ${expiresInMinutes} minutos.`,
      note1: `Por segurança, este código expira em ${expiresInMinutes} minutos. Se você não solicitou este código, ignore esta mensagem.`,
      note2: 'Nunca pediremos este código por telefone ou outro canal. — Equipe TERA',
      subject: `${code} é o seu código TERA`,
      preview: `Seu código de verificação TERA: ${code}`,
    },
  }[l];

  const html = layout(`
    ${heading(T.heading)}
    ${subheading(T.subheading)}
    ${divider()}
    ${codeBlock(code)}
    ${divider()}
    ${note(T.note1)}
    ${note(T.note2)}
  `, T.preview, l);

  try {
    await resend.emails.send({ from: FROM, to: email, subject: T.subject, html });
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
  confirmLink: string,
  lang?: string
): Promise<boolean> {
  const resend = getResendClient();
  if (!resend) return false;
  const l = normLang(lang);

  const T = {
    es: {
      heading: 'Confirmá tu nuevo email',
      subheading: 'Solicitaste cambiar la dirección de email de tu cuenta de TERA.',
      boxLabel: 'Cambio de email',
      previous: 'Anterior:',
      newLabel: 'Nuevo:',
      p: 'Hacé click para confirmar que querés usar este nuevo email en tu cuenta.',
      btn: 'Confirmar nuevo email',
      note1: '⚠️ Si no solicitaste este cambio, ignorá este mensaje. Tu email actual seguirá siendo el mismo.',
      note2: 'Este enlace vence en 24 horas.',
      subject: 'Confirmá tu nuevo email — TERA',
      preview: 'Confirmá el cambio de email en TERA',
    },
    en: {
      heading: 'Confirm your new email',
      subheading: 'You requested to change the email address of your TERA account.',
      boxLabel: 'Email change',
      previous: 'Previous:',
      newLabel: 'New:',
      p: 'Click to confirm you want to use this new email for your account.',
      btn: 'Confirm new email',
      note1: "⚠️ If you didn't request this change, ignore this message. Your current email will remain the same.",
      note2: 'This link expires in 24 hours.',
      subject: 'Confirm your new email — TERA',
      preview: 'Confirm your email change on TERA',
    },
    pt: {
      heading: 'Confirme seu novo email',
      subheading: 'Você solicitou alterar o endereço de email da sua conta TERA.',
      boxLabel: 'Alteração de email',
      previous: 'Anterior:',
      newLabel: 'Novo:',
      p: 'Clique para confirmar que deseja usar este novo email na sua conta.',
      btn: 'Confirmar novo email',
      note1: '⚠️ Se você não solicitou esta alteração, ignore esta mensagem. Seu email atual permanecerá o mesmo.',
      note2: 'Este link expira em 24 horas.',
      subject: 'Confirme seu novo email — TERA',
      preview: 'Confirme a alteração de email na TERA',
    },
  }[l];

  const html = layout(`
    ${heading(T.heading)}
    ${subheading(T.subheading)}
    ${divider()}
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;background:#f8fafc;border-radius:10px;">
      <tr>
        <td style="padding:16px 20px;">
          <p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">${T.boxLabel}</p>
          <table cellpadding="0" cellspacing="0">
            <tr>
              <td style="font-size:13px;color:#94a3b8;width:80px;">${T.previous}</td>
              <td style="font-size:13px;color:#334155;">${oldEmail}</td>
            </tr>
            <tr style="height:6px;"></tr>
            <tr>
              <td style="font-size:13px;color:#94a3b8;width:80px;">${T.newLabel}</td>
              <td style="font-size:14px;font-weight:700;color:#0061D5;">${newEmail}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    ${p(T.p)}
    ${btn(T.btn, confirmLink)}
    ${divider()}
    ${note(T.note1)}
    ${note(T.note2)}
  `, T.preview, l);

  try {
    await resend.emails.send({ from: FROM, to: newEmail, subject: T.subject, html });
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
  details: { filesProcessed?: number; duration?: number; errorMessage?: string },
  lang?: string
): Promise<boolean> {
  const resend = getResendClient();
  if (!resend) return false;
  const l = normLang(lang);

  const filesUnit = { es: 'archivo(s)', en: 'file(s)', pt: 'arquivo(s)' }[l];
  const durationStr = details.duration ? `${details.duration}s` : null;
  const filesStr = details.filesProcessed !== undefined ? `${details.filesProcessed} ${filesUnit}` : null;

  const T = {
    es: {
      successBadge: 'Completada', failBadge: 'Fallida',
      successHeading: 'Tarea completada con éxito ✅', failHeading: 'Error en la tarea programada ❌',
      successSubheading: `La tarea <strong>${taskName}</strong> finalizó correctamente.`,
      failSubheading: `La tarea <strong>${taskName}</strong> no pudo completarse.`,
      filesLabel: 'Archivos procesados:', durationLabel: 'Duración:', errorLabel: 'Error',
      successBtn: 'Ver operaciones', failBtn: 'Revisar configuración',
      successNote: 'Esta notificación fue enviada porque tenés activadas las alertas de tareas en TERA.',
      failNote: 'Revisá la configuración de tu tarea o las conexiones de tus cuentas en Integraciones.',
      successSubject: `✅ Tarea completada: ${taskName}`, failSubject: `❌ Tarea fallida: ${taskName}`,
      successPreview: `Tarea completada: ${taskName}`, failPreview: `Tarea fallida: ${taskName}`,
    },
    en: {
      successBadge: 'Completed', failBadge: 'Failed',
      successHeading: 'Task completed successfully ✅', failHeading: 'Error in scheduled task ❌',
      successSubheading: `The task <strong>${taskName}</strong> finished successfully.`,
      failSubheading: `The task <strong>${taskName}</strong> could not be completed.`,
      filesLabel: 'Files processed:', durationLabel: 'Duration:', errorLabel: 'Error',
      successBtn: 'View operations', failBtn: 'Check configuration',
      successNote: 'This notification was sent because you have task alerts enabled in TERA.',
      failNote: 'Check your task configuration or your account connections in Integrations.',
      successSubject: `✅ Task completed: ${taskName}`, failSubject: `❌ Task failed: ${taskName}`,
      successPreview: `Task completed: ${taskName}`, failPreview: `Task failed: ${taskName}`,
    },
    pt: {
      successBadge: 'Concluída', failBadge: 'Falhou',
      successHeading: 'Tarefa concluída com sucesso ✅', failHeading: 'Erro na tarefa agendada ❌',
      successSubheading: `A tarefa <strong>${taskName}</strong> foi concluída com sucesso.`,
      failSubheading: `A tarefa <strong>${taskName}</strong> não pôde ser concluída.`,
      filesLabel: 'Arquivos processados:', durationLabel: 'Duração:', errorLabel: 'Erro',
      successBtn: 'Ver operações', failBtn: 'Verificar configuração',
      successNote: 'Esta notificação foi enviada porque você tem alertas de tarefas ativados na TERA.',
      failNote: 'Verifique a configuração da sua tarefa ou as conexões das suas contas em Integrações.',
      successSubject: `✅ Tarefa concluída: ${taskName}`, failSubject: `❌ Tarefa falhou: ${taskName}`,
      successPreview: `Tarefa concluída: ${taskName}`, failPreview: `Tarefa falhou: ${taskName}`,
    },
  }[l];

  const html = success
    ? layout(`
        <table cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
          <tr><td>${badge(T.successBadge, '#16a34a', '#dcfce7')}</td></tr>
        </table>
        ${heading(T.successHeading)}
        ${subheading(T.successSubheading)}
        ${divider()}
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:10px;margin-bottom:24px;">
          <tr><td style="padding:20px;">
            ${filesStr ? `<p style="margin:0 0 10px;font-size:14px;color:#334155;"><span style="color:#64748b;">${T.filesLabel}</span> <strong>${filesStr}</strong></p>` : ''}
            ${durationStr ? `<p style="margin:0;font-size:14px;color:#334155;"><span style="color:#64748b;">${T.durationLabel}</span> <strong>${durationStr}</strong></p>` : ''}
          </td></tr>
        </table>
        ${btn(T.successBtn, `${APP_URL}/operations`, '#16a34a')}
        ${divider()}
        ${note(T.successNote)}
      `, T.successPreview, l)
    : layout(`
        <table cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
          <tr><td>${badge(T.failBadge, '#dc2626', '#fee2e2')}</td></tr>
        </table>
        ${heading(T.failHeading)}
        ${subheading(T.failSubheading)}
        ${divider()}
        ${details.errorMessage ? `
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#fef2f2;border-left:3px solid #dc2626;border-radius:0 8px 8px 0;margin-bottom:24px;">
            <tr><td style="padding:16px 20px;">
              <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#dc2626;text-transform:uppercase;letter-spacing:0.5px;">${T.errorLabel}</p>
              <p style="margin:0;font-size:13px;color:#7f1d1d;font-family:monospace;">${details.errorMessage}</p>
            </td></tr>
          </table>` : ''}
        ${btn(T.failBtn, `${APP_URL}/tasks`, '#dc2626')}
        ${divider()}
        ${note(T.failNote)}
      `, T.failPreview, l);

  const subject = success ? T.successSubject : T.failSubject;

  try {
    await resend.emails.send({ from: FROM, to: email, subject, html });
    return true;
  } catch (err) {
    console.error('sendTaskNotificationEmail error:', err);
    return false;
  }
}

// ── 7. Acceso anticipado ──────────────────────────────────────────────────────

export async function sendEarlyAccessEmail(email: string, firstName?: string, lang?: string): Promise<boolean> {
  const resend = getResendClient();
  if (!resend) return false;
  const l = normLang(lang);

  const fallbackName = { es: 'ahí', en: 'there', pt: 'aí' }[l];
  const name = firstName || fallbackName;

  const T = {
    es: {
      badge: 'Acceso anticipado',
      heading: `¡Estás dentro, ${name}! 🚀`,
      subheading: 'Sos parte del grupo de early adopters de TERA. Gracias por ser de los primeros.',
      intro: 'Tenés acceso anticipado a todas las funciones de TERA:',
      features: [
        ['☁️', 'Google Drive, Dropbox, OneDrive, Box y Amazon S3'],
        ['⚡', 'Transferencias ilimitadas entre nubes'],
        ['🗓️', 'Tareas programadas automáticas'],
        ['📊', 'Analytics de tus transferencias'],
        ['🔐', 'Encriptación de extremo a extremo'],
      ] as [string, string][],
      btn: 'Acceder a TERA ahora →',
      p: 'Tu feedback es muy valioso para nosotros. Respondé este email con cualquier sugerencia, bug o idea — lo leemos todo.',
      note: '— Facundo y el equipo de TERA 🙌',
      subject: `¡Acceso anticipado activado, ${name}! 🚀 — TERA`,
      preview: `¡Bienvenido al early access de TERA, ${name}!`,
    },
    en: {
      badge: 'Early access',
      heading: `You're in, ${name}! 🚀`,
      subheading: "You're part of TERA's early adopters group. Thanks for being one of the first.",
      intro: "You have early access to all of TERA's features:",
      features: [
        ['☁️', 'Google Drive, Dropbox, OneDrive, Box and Amazon S3'],
        ['⚡', 'Unlimited transfers between clouds'],
        ['🗓️', 'Automatic scheduled tasks'],
        ['📊', 'Analytics for your transfers'],
        ['🔐', 'End-to-end encryption'],
      ] as [string, string][],
      btn: 'Access TERA now →',
      p: 'Your feedback is very valuable to us. Reply to this email with any suggestion, bug, or idea — we read everything.',
      note: '— Facundo and the TERA team 🙌',
      subject: `Early access activated, ${name}! 🚀 — TERA`,
      preview: `Welcome to TERA's early access, ${name}!`,
    },
    pt: {
      badge: 'Acesso antecipado',
      heading: `Você está dentro, ${name}! 🚀`,
      subheading: 'Você faz parte do grupo de early adopters da TERA. Obrigado por ser um dos primeiros.',
      intro: 'Você tem acesso antecipado a todas as funcionalidades da TERA:',
      features: [
        ['☁️', 'Google Drive, Dropbox, OneDrive, Box e Amazon S3'],
        ['⚡', 'Transferências ilimitadas entre nuvens'],
        ['🗓️', 'Tarefas agendadas automáticas'],
        ['📊', 'Analytics das suas transferências'],
        ['🔐', 'Criptografia de ponta a ponta'],
      ] as [string, string][],
      btn: 'Acessar a TERA agora →',
      p: 'Seu feedback é muito valioso para nós. Responda este email com qualquer sugestão, bug ou ideia — nós lemos tudo.',
      note: '— Facundo e a equipe TERA 🙌',
      subject: `Acesso antecipado ativado, ${name}! 🚀 — TERA`,
      preview: `Bem-vindo ao acesso antecipado da TERA, ${name}!`,
    },
  }[l];

  const html = layout(`
    <table cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr><td>${badge(T.badge, '#7c3aed', '#ede9fe')}</td></tr>
    </table>
    ${heading(T.heading)}
    ${subheading(T.subheading)}
    ${divider()}
    ${p(T.intro)}
    ${featureList(T.features)}
    ${btn(T.btn, `${APP_URL}`, '#7c3aed')}
    ${divider()}
    ${p(T.p)}
    ${note(T.note)}
  `, T.preview, l);

  try {
    await resend.emails.send({ from: FROM, to: email, subject: T.subject, html });
    return true;
  } catch (err) {
    console.error('sendEarlyAccessEmail error:', err);
    return false;
  }
}
