const express = require("express");
const router = express.Router();
const sendEmail = require("../utils/email");

router.post("/", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }

    await sendEmail({ name, email, message });

    res.status(200).json({ message: "Message sent successfully" });
  } catch (err) {
    console.error("Contact form error:", err);
    res.status(500).json({ message: "Failed to send message" });
  }
});

module.exports = router;
