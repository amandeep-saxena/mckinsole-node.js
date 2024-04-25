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
