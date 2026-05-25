import nodemailer from "nodemailer";
const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET_KEY;

export async function POST(req: Request) {
  try {
    const { name, email, message, token } = await req.json();

    if (!name || !email || !message  || !token) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }
    // Verify reCAPTCHA
    const verifyRes = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `secret=${RECAPTCHA_SECRET}&response=${token}`,
    });

    const verifyData = await verifyRes.json();
    if (!verifyData.success) {
      return Response.json({ error: "reCAPTCHA verification failed" }, { status: 400 });
    }

    // Transporter configuration
    const transporter = nodemailer.createTransport({
      service: "gmail", // You can change this to Outlook, Yahoo, etc.
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Email content
    const mailOptions = {
      from: email,
      to: process.env.EMAIL_TO || process.env.EMAIL_USER, // who receives it
      subject: `New message from ${name}`,
      text: `
Name: ${name}
Email: ${email}

Message:
${message}
      `,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    return Response.json({ success: true });
  } catch (error) {
    console.error("Email error:", error);
    return Response.json({ error: "Failed to send message" }, { status: 500 });
  }
}