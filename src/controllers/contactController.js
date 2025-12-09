// src/controllers/contactController.js
const Contact = require('../models/Contact');
const nodemailer = require('nodemailer'); // npm install nodemailer

// Gmail transporter setup (तुम्हारा email config)
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,      // .env में add करो
    pass: process.env.EMAIL_PASS       // .env में add करो (App Password)
  }
});

exports.sendContactMessage = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    
    console.log('🚨 NEW CONTACT:', { name, email, phone, subject, message });

    // 1. DATABASE SAVE
    const newContact = new Contact({ name, email, phone, subject, message });
    await newContact.save();

    // 2. EMAIL SEND (तुम्हारे email पर)
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL,  // तुम्हारा email (.env में)
      subject: `🏠 New Contact: ${subject || 'General Inquiry'}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #667eea;">New Contact Form Submission</h2>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
            <p><strong>Subject:</strong> ${subject || 'General'}</p>
            <p><strong>Message:</strong></p>
            <p style="background: white; padding: 15px; border-left: 4px solid #667eea;">${message}</p>
          </div>
          <p style="color: #666;"><em>Submitted on: ${new Date().toLocaleString()}</em></p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ EMAIL SENT SUCCESSFULLY');

    res.status(200).json({ message: 'Message sent successfully! We received your inquiry.' });
  } catch (error) {
    console.error('🚨 CONTACT ERROR:', error);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};
