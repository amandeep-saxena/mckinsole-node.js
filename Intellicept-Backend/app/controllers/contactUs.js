const express = require("express");
const ContactUs = require("../models/contactUs");
const mailer = require("../utils/mailSender");

module.exports = function (app) {
  const apiRoutes = express.Router();

  apiRoutes.post("/contactUs", async (req, res) => {
    try {
      const { name, email, subject, message } = req.body;
      const data = await ContactUs.create({ name, email, subject, message });
      res.status(200).json(data);

      //   const emailHtml = `
      //   <html>
      //     <head>
      //       <style>
      //         body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
      //         .email-container { background-color: #ffffff; padding: 20px; margin: 0 auto; width: 80%; max-width: 600px; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
      //         h2 { color: #0073e6; }
      //         p { font-size: 16px; }
      //         .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #999; }
      //       </style>
      //     </head>
      //     <body>
      //       <div class="email-container">
      //         <h2>Job Application Received</h2>
      //         <p>Dear ${name},</p>
      //         <p>Thank you for applying for the position. We have received your application and resume.</p>
      //         <p>Best regards,</p>
      //         <p>Intellicept</p>
      //       </div>
      //       <div class="footer">
      //         <p>&copy; 2024 Intellicept. All rights reserved.</p>
      //       </div>
      //     </body>
      //   </html>
      // `;

      // mailer([email], "Job Application Received", emailHtml);

      // res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  apiRoutes.get("/get-contactUs", async (req, res) => {
    try {
      const data = await ContactUs.findAll();
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.use("/", apiRoutes);
};
