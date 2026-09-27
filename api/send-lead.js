export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const notificationEmail = process.env.LEAD_NOTIFICATION_EMAIL;
  const businessWhatsapp = String(
    process.env.BUSINESS_WHATSAPP_NUMBER || ""
  ).replace(/\D/g, "");

  if (!apiKey || !notificationEmail || !businessWhatsapp) {
    console.error("Lead notification environment variables are missing.");
    return res.status(500).json({
      error: "Lead notification is not configured yet.",
    });
  }

  const {
    name,
    phone,
    email,
    projectType,
    message,
  } = req.body || {};

  if (!name || !phone || !email || !projectType || !message) {
    return res.status(400).json({
      error: "All enquiry fields are required.",
    });
  }

  const escapeHtml = (value) =>
    String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  const whatsappText = [
    "Hi IronCore, I just submitted a website enquiry.",
    "",
    `Name: ${name}`,
    `Phone: ${phone}`,
    `Email: ${email}`,
    `Project: ${projectType}`,
    `Requirements: ${message}`,
  ].join("\n");

  const whatsappUrl =
    `https://wa.me/${businessWhatsapp}?text=${encodeURIComponent(whatsappText)}`;

  try {
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "IronCore Website <onboarding@resend.dev>",
        to: [notificationEmail],
        reply_to: email,
        subject: `New Website Enquiry — ${name}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:640px;margin:auto;color:#171713">
            <h2 style="margin-bottom:24px">New Website Enquiry</h2>
            <p><strong>Name:</strong> ${escapeHtml(name)}</p>
            <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
            <p><strong>Email:</strong> ${escapeHtml(email)}</p>
            <p><strong>Project type:</strong> ${escapeHtml(projectType)}</p>
            <p><strong>Requirements:</strong></p>
            <div style="padding:16px;background:#f4f4f0;border-radius:8px;white-space:pre-wrap">${escapeHtml(message)}</div>
            <p style="margin-top:24px;color:#666">Submitted from the IronCore website.</p>
          </div>
        `,
      }),
    });

    const data = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error("Resend error:", data);
      return res.status(502).json({
        error: "The email notification could not be sent.",
      });
    }

    return res.status(200).json({
      success: true,
      whatsappUrl,
      emailId: data.id,
    });
  } catch (error) {
    console.error("Lead notification error:", error);
    return res.status(500).json({
      error: "Unable to send the enquiry right now.",
    });
  }
}
