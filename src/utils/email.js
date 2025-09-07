const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // ✅ Gmail
    pass: process.env.EMAIL_PASS, // ✅ App password
  },
});

const sendEmail = async ({ name, email, message }) => {
  const mailOptions = {
    from: email, // sender
    to: process.env.EMAIL_USER, // where you’ll receive it
    subject: `New Contact Form Submission from ${name}`,
    text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
  };

  return transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
