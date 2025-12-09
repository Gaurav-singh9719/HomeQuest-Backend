const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: process.env.EMAIL_SECURE === "true", // Gmail requires secure=true for 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async ({ name, email, phone, subject, message }) => {
  const mailOptions = {
    from: `"HomeQuest Contact" <${process.env.EMAIL_USER}>`, // Must be your gmail
    to: process.env.ADMIN_EMAIL, // Your email
    subject: `New Contact Form: ${subject || "General Inquiry"}`,
    html: `
      <h2>New Contact</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone || "N/A"}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `
  };

  return transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
