const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async ({ name, email, phone, subject, message }) => {
  const mailOptions = {
    from: `"HomeQuest Contact" <${process.env.EMAIL_USER}>`,
    to: process.env.ADMIN_EMAIL,
    subject: `🏠 New Contact Form: ${subject || "General Inquiry"}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; max-width: 600px; margin: auto;">
        <h2 style="color: #4f46e5;">New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || "N/A"}</p>
        <p><strong>Subject:</strong> ${subject || "General"}</p>
        <p><strong>Message:</strong></p>
        <p style="padding: 10px; background: #f0f0f0; border-left: 4px solid #4f46e5;">${message}</p>
        <p style="color: #555; font-size: 0.85rem;"><em>Submitted on: ${new Date().toLocaleString()}</em></p>
      </div>
    `
  };

  return transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
