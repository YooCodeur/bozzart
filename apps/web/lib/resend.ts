const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = "Bozzart <noreply@bozzart.art>";

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions): Promise<void> {
  if (!RESEND_API_KEY) {
    console.warn("[Resend] API key not configured, skipping email");
    return;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Resend error: ${error}`);
  }
}

export async function sendWelcomeEmail(to: string, displayName: string): Promise<void> {
  await sendEmail({
    to,
    subject: "Bienvenue sur Bozzart",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Bienvenue, ${displayName} !</h1>
        <p>Merci de rejoindre Bozzart, la marketplace d'art contemporain.</p>
        <p>Decouvrez des artistes et leurs oeuvres sur <a href="https://bozzart.art">bozzart.art</a>.</p>
        <p style="color: #999; font-size: 12px; margin-top: 40px;">Bozzart — bozzart.art</p>
      </div>
    `,
  });
}

export async function sendPurchaseConfirmationEmail(
  to: string,
  artworkTitle: string,
  artistName: string,
  amount: number,
  currency: string,
  certificateUrl?: string,
): Promise<void> {
  await sendEmail({
    to,
    subject: `Confirmation d'achat — ${artworkTitle}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Merci pour votre achat !</h1>
        <p>Vous avez acquis <strong>${artworkTitle}</strong> par ${artistName} pour ${amount} ${currency}.</p>
        ${certificateUrl ? `<p><a href="${certificateUrl}" style="color: #7e22ce;">Telecharger votre certificat d'authenticite</a></p>` : ""}
        <p>L'artiste a ete notifie et preparera l'envoi de votre oeuvre.</p>
        <p style="color: #999; font-size: 12px; margin-top: 40px;">Bozzart — bozzart.art</p>
      </div>
    `,
  });
}
