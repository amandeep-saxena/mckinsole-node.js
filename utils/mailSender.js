const nodemailer = require("nodemailer");

const mailSender = async (email, titel, body) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "abhinavsaxena119@gmail.com",
        pass: "bkwgjnfawvkmpjhe",
      },
    });

    let info = await transporter.sendMail({
      // from: "kohotit924@em2lab.com",
      to: email,
      subject: titel,
      text: body,
    });
    console.log("Email info: ", info);
    return info;
  } catch (error) {
    console.log(error.message);
  }
};
module.exports = mailSender;








// const nodemailer = require("nodemailer");
// const smtp = require("../config/main");
// const fs = require("fs");

// let smtpAuth = {
//   user: smtp.smtpuser,
//   pass: smtp.smtppass,
// };

// let smtpConfig = {
//   host: smtp.smtphost,
//   port: smtp.smtpport,
//   secure: false,
//   auth: smtpAuth,
// };

// let transporter = nodemailer.createTransport(smtpConfig);

// transporter.verify(function (error, success) {
//   if (error) {
//     console.log(error);
//   } else {
//     console.log("Server is ready to take our messages");
//   }
// });

// function mailer(email, subject, message, attachmentPath) {
//   // const fileContent = fs.readFileSync(attachmentPath);
//   transporter.sendMail(
//     {
//       from: {
//         name: "intelligentMDG",
//         address: "partner.alliances@Neuvays.com",
//       },
//       to: email.join(', '),
//       subject: subject,
//       html: message,
//       attachments: [
//         {
//           filename: "logo.png",
//           path: "./image/image (1).png",
//           cid: "logoImage",
//         },
//       ],
//     },
//     (error, info) => {
//       if (error) {
//         console.error("Error sending email:", error);
//       } else {
//         console.log("Email sent:", info.response);
//       }
//     }
//   );
// }

// module.exports = mailer;










