const Contact = require("../models/Contact");
const sendEmail = require("../utils/email");

exports.sendContactMessage = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: "All required fields missing" });
    }

    await Contact.create({ name, email, phone, subject, message });
    await sendEmail({ name, email, phone, subject, message });

    res.status(200).json({ message: "Message sent successfully!" });
  } catch (err) {
    console.error("📨 CONTACT ERROR:", err);
    res.status(500).json({ message: "Failed to send message" });
  }
};
