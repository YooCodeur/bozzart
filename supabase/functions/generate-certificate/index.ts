import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.0";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

function generateCertificateNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `CERT-${year}-${random}`;
}

serve(async (req) => {
  const { transactionId } = await req.json();

  // Recuperer la transaction avec ses relations
  const { data: transaction, error } = await supabase
    .from("transactions")
    .select(`
      *,
      artwork:artworks(title, primary_image_url, medium, dimensions),
      artist:artist_profiles(full_name, slug)
    `)
    .eq("id", transactionId)
    .single();

  if (error || !transaction) {
    return new Response(JSON.stringify({ error: "Transaction not found" }), { status: 404 });
  }

  const certificateNumber = generateCertificateNumber();

  // Generer le HTML du certificat (sera converti en PDF par un service externe ou jsPDF)
  const certificateHtml = `
    <!DOCTYPE html>
    <html lang="fr">
    <head><meta charset="UTF-8"><title>Certificat d'authenticite</title></head>
    <body style="font-family: Georgia, serif; max-width: 800px; margin: 0 auto; padding: 40px;">
      <div style="text-align: center; border: 2px solid #333; padding: 60px 40px;">
        <h1 style="font-size: 28px; margin-bottom: 8px;">Certificat d'Authenticite</h1>
        <p style="color: #666; font-size: 14px; margin-bottom: 40px;">Bozzart — bozzart.art</p>

        <p style="font-size: 12px; color: #999;">N° ${certificateNumber}</p>

        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;" />

        <p style="font-size: 18px; margin-bottom: 4px;"><strong>${transaction.artwork.title}</strong></p>
        <p style="color: #666;">par ${transaction.artist.full_name}</p>

        <div style="margin: 30px 0; text-align: left; padding: 0 40px;">
          <p><strong>Technique :</strong> ${transaction.artwork.medium}</p>
          ${transaction.artwork.dimensions ? `<p><strong>Dimensions :</strong> ${transaction.artwork.dimensions}</p>` : ""}
          <p><strong>Prix d'acquisition :</strong> ${transaction.amount} ${transaction.currency}</p>
          <p><strong>Date d'acquisition :</strong> ${new Date(transaction.paid_at).toLocaleDateString("fr-FR")}</p>
          <p><strong>Acquereur :</strong> ${transaction.guest_name || "Collectionneur"}</p>
        </div>

        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;" />

        <p style="font-size: 11px; color: #999; margin-top: 40px;">
          Ce certificat atteste de l'authenticite de l'oeuvre et de la transaction realisee
          sur la plateforme Bozzart (bozzart.art).
        </p>
        <p style="font-size: 11px; color: #999;">
          Emis le ${new Date().toLocaleDateString("fr-FR")}
        </p>
      </div>
    </body>
    </html>
  `;

  // Sauvegarder le HTML comme fichier temporaire
  // En production, on utiliserait un service de generation PDF (Puppeteer, wkhtmltopdf, ou API externe)
  const encoder = new TextEncoder();
  const htmlBuffer = encoder.encode(certificateHtml);

  const fileName = `certificates/${transactionId}.html`;
  await supabase.storage.from("certificates").upload(fileName, htmlBuffer, {
    contentType: "text/html",
    upsert: true,
  });

  const { data: urlData } = supabase.storage.from("certificates").getPublicUrl(fileName);

  // Sauvegarder le certificat en base
  await supabase.from("certificates").insert({
    transaction_id: transactionId,
    certificate_number: certificateNumber,
    pdf_url: urlData.publicUrl,
    issued_at: new Date().toISOString(),
  });

  // Mettre a jour la transaction
  await supabase
    .from("transactions")
    .update({
      certificate_url: urlData.publicUrl,
      certificate_issued_at: new Date().toISOString(),
    })
    .eq("id", transactionId);

  // Envoyer le certificat par email
  const buyerEmail = transaction.guest_email;
  if (buyerEmail) {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (resendApiKey) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: "Bozzart <noreply@bozzart.art>",
          to: buyerEmail,
          subject: `Certificat d'authenticite — ${transaction.artwork.title}`,
          html: `
            <p>Bonjour,</p>
            <p>Merci pour votre achat de <strong>${transaction.artwork.title}</strong> par ${transaction.artist.full_name}.</p>
            <p>Votre certificat d'authenticite (n° ${certificateNumber}) est disponible ici :</p>
            <p><a href="${urlData.publicUrl}">Voir le certificat</a></p>
            <p>A bientot sur Bozzart.</p>
          `,
        }),
      });
    }
  }

  return new Response(JSON.stringify({ certificateNumber, url: urlData.publicUrl }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
