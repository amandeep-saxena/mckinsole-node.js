const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const UserData = require("../models/careerPage");
const mailer = require("../utils/mailSender");
const ejs = require('ejs');


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.resolve("uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

let upload = multer({ storage: storage });

module.exports = function (app) {
  const apiRoutes = express.Router();

  // apiRoutes.post("/User", upload.single("file"), async (req, res) => {
  //   try {
  //     const { name, email, phone, desc } = req.body;
  //     const file = req.file ? req.file.path : null;

  //     const newUser = await UserData.create({
  //       name,
  //       email,
  //       phone,
  //       desc,
  //       file,
  //     });

  //     const emailHtml = `
  //       <html>
  //         <head>
  //           <style>
  //             body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
  //             .email-container { background-color: #ffffff; padding: 20px; margin: 0 auto; width: 80%; max-width: 600px; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
  //             h2 { color: #0073e6; }
  //             p { font-size: 16px; }
  //             .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #999; }
  //           </style>
  //         </head>
  //         <body>
  //           <div class="email-container">
  //             <h2>Job Application Received</h2>
  //             <p>Dear ${name},</p>
  //             <p>Thank you for applying for the position. We have received your application and resume.</p>
  //             <p>Best regards,</p>
  //             <p>Intellicept</p>
  //           </div>
  //           <div class="footer">
  //             <p>&copy; 2024 Intellicept. All rights reserved.</p>
  //           </div>
  //         </body>
  //       </html>
  //     `;

  //     mailer([email], "Job Application Received", emailHtml);

  //     res.status(200).json({
  //       message: "User created successfully",
  //       user: newUser,
  //     });
  //   } catch (error) {
  //     console.error("Error creating user:", error);
  //     res.status(500).json({ message: "Internal Server Error" });
  //   }
  // });

  
  apiRoutes.post("/User", upload.single("file"), async (req, res) => {
    try {
      const { name, email, phone, desc } = req.body;
      const file = req.file ? req.file.path : null;
  
      const newUser = await UserData.create({
        name,
        email,
        phone,
        desc,
        file,
      });
  
      // Define the path to your email template
      const emailTemplatePath = path.join('email.ejs');
  
      // Render the email HTML using EJS, passing in the name
      ejs.renderFile(emailTemplatePath, { name }, (err, emailHtml) => {
        if (err) {
          console.error('Error rendering EJS template:', err);
          return res.status(500).json({ message: 'Error generating email' });
        }
  
        // Send the email using your mailer
        mailer([email], "Job Application Received", emailHtml);
  
        res.status(200).json({
          message: "User created successfully",
          user: newUser,
        });
      });
      
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });
  
  

  apiRoutes.get("/user-data", async (req, res) => {
    try {
      const users = await UserData.findAll(); 
      const userList = users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        desc: user.desc,
        fileUrl: user.file ? `${req.protocol}://${req.get("host")}/uploads/${path.basename(user.file)}` : null,
      }));

      res.status(200).json({
        users: userList, 
      });
    } catch (error) {
      console.error("Error fetching user data:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  app.use("/uploads", express.static(path.join("uploads")));

  app.use("/", apiRoutes);
};

