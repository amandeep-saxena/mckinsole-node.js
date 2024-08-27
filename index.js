const express = require("express");
const app = express();
const path = require("path");
const port = 7000;
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const Login = require("./model/User");
const bodyParser = require("body-parser");
const verifyToken = require("./middleware/authMiddleware");
const jwt = require("jsonwebtoken");
var morgan = require("morgan");
const Admin = require("./model/Admin");
const otpGenerator = require("otp-generator");
const OTP = require("./model/otpModel");
const multer = require("multer");
const xlsx = require("xlsx");
// const countryData = require("country-code-flag-phone-extension-json");
const fs = require("fs");
// const Modem = require("node-modem");
const mailSender = require("./utils/mailSender");

app.use(morgan("dev"));
app.use(express.json());
app.use(bodyParser.json());

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadDir = "uploads/";
    if (
      file.mimetype ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      uploadDir = "xlse/";
    }
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const name = file.fieldname + "-" + Date.now() + ext;
    cb(null, name);
  },
});

const upload = multer({ storage: storage });
// var storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "uploads");
//   },
//   filename: function (req, file, cb) {
//     cb(null, file.fieldname + "-" + Date.now() + ".jpg");
//   },
// });

// const storage1 = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "xlse");
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + path.extname(file.originalname));
//   },
// });

// const upload = multer({
//   dest: "uploads/",
//   Storage: storage,
// });

// const SerialPort = require("serialport");
// const Readline = require("@serialport/parser-readline");

// const serialPort = SerialPort("COM1", { baudRate: 9600 });
// const parser = serialPort.pipe(new Readline({ delimiter: "\r\n" }));

function generateOTP() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

const otpStore = new Map();

mongoose
  .connect(
    "mongodb+srv://saxenaman903:7iBj7Pkhtfj2bMGl@cluster0.j2jkj8p.mongodb.net/"
  )
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Failed to connect to MongoDB", err));

function generateCaptcha() {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789#@$%&*";
  let captcha = "";

  for (let i = 0; i < 6; i++) {
    captcha += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return captcha;
}

const checkPasswordValidity = (value) => {
  if (value.includes(" ")) {
    return "Password must not contain Whitespaces.";
  }

  let hasUppercase = false;
  let hasLowercase = false;
  let hasNumber = false;
  let hasSymbol = false;

  // Iterate through each character of the password
  for (let i = 0; i < value.length; i++) {
    const char = value[i];

    // Check for uppercase letters
    if (char >= "A" && char <= "Z") {
      hasUppercase = true;
    }

    // Check for lowercase letters
    if (char >= "a" && char <= "z") {
      hasLowercase = true;
    }

    // Check for numbers
    if (char >= "0" && char <= "9") {
      hasNumber = true;
    }

    // Check for special symbols
    const symbols = "~`!@#$%^&*()--+={}[\\]|:;\"'<>,.?/_₹";
    if (symbols.includes(char)) {
      hasSymbol = true;
    }
  }

  if (!hasUppercase) {
    return "Password must have at least one Uppercase Character.";
  }

  if (!hasLowercase) {
    return "Password must have at least one Lowercase Character.";
  }

  if (!hasNumber) {
    return "Password must contain at least one Digit.";
  }

  if (!hasSymbol) {
    return "Password must contain at least one Special Symbol.";
  }

  if (value.length < 10 || value.length > 16) {
    return "Password must be 10-16 Characters Long.";
  }

  return null;
  // const isNonWhiteSpace = /^\S*$/;
  // if (!isNonWhiteSpace.test(value)) {
  //   return "Password must not contain Whitespaces.";
  // }

  // const isContainsUppercase = /^(?=.*[A-Z]).*$/;
  // if (!isContainsUppercase.test(value)) {
  //   return "Password must have at least one Uppercase Character.";
  // }

  // const isContainsLowercase = /^(?=.*[a-z]).*$/;
  // if (!isContainsLowercase.test(value)) {
  //   return "Password must have at least one Lowercase Character.";
  // }

  // const isContainsNumber = /^(?=.*[0-9]).*$/;
  // if (!isContainsNumber.test(value)) {
  //   return "Password must contain at least one Digit.";
  // }

  // const isContainsSymbol = /^(?=.*[~`!@#$%^&*()--+={}\[\]|\\:;"'<>,.?/_₹]).*$/;
  // if (!isContainsSymbol.test(value)) {
  //   return "Password must contain at least one Special Symbol.";
  // }

  // const isValidLength = /^.{10,16}$/;
  // if (!isValidLength.test(value)) {
  //   return "Password must be 10-16 Characters Long.";
  // }

  // return null;
};

app.post("/otp", async (req, res) => {
  try {
    const { email } = req.body;
    // const checkUserPresent = await Login.findOne({ email });

    // if (!checkUserPresent) {
    //   return res
    //     .status(401)
    //     .json({ success: false, message: "User is already registered" });
    // }
    let otp = otpGenerator.generate(6, {
      upperCaseAlphabets: true,
      lowerCaseAlphabets: true,
      specialChars: true,
    });

    let result = await OTP.findOne({ otp: otp });
    while (result) {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
      });
      result = await OTP.findOne({ otp: otp });
      console.log(result);
    }

    const otpPayload = { email, otp };
    const otpBody = await OTP.create(otpPayload).select("-otp-body");
    console.log(otpBody);
    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      otp,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/loginOTP", async (req, res) => {
  const { email, otp } = req.body;

  const otpEntry = await OTP.findOne({ email, otp });

  if (!otpEntry) {
    return res.status(401).json({
      success: false,
      message: "Invalid OTP or email",
    });
  }

  res.status(200).json({
    success: true,
    message: "Login successful",
  });
});

app.post("/register", async (req, res) => {
  const { name, email, password, otp } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Nman Filed insert data" });
  }
  if (!password) {
    return res.status(400).json({ message: "password Filed  insert data" });
  }
  if (!otp) {
    return res.status(400).json({ message: "OTP Filed  insert data" });
  }

  const passwordValidationMessage = checkPasswordValidity(password);
  if (passwordValidationMessage) {
    return res.status(400).json({ message: passwordValidationMessage });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }
  // if (!name || !email || !password) {
  //   return res.status(400).json({ message: "All fields are required" });
  // }
  // Check if user already exists
  const existingUser = await Login.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  const response = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);
  if (response.length === 0 || otp !== response[0].otp) {
    return res.status(400).json({
      success: false,
      message: "The OTP is not valid",
    });
  }
  console.log(response);

  const user = new Login({
    name,
    email,
    password: bcrypt.hashSync(req.body.password, 8),
  });
  await user.save();

  mailSender(
    email,
    (titel = "Hello from Nodemailer"),
    (body = "User Register Successful.")
  );

  res.status(201).send(user);
});

// const token = jwt.sign(
//   { user_id: user._id, email },
//   "aman@123",
//   {
//     expiresIn: "1m",
//   }
// );
// user.token = token;

//   Generate JWT token
//   const token = jwt.sign({ userId: user._id, email: user.email }, 'aman@12', { expiresIn: '1h' });

//      res.status(201).json({ token });

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const data = await Login.findOne({ email });
  if (!data) {
    console.log("Invalid username:", email);
    return res.status(401).json({ error: "invalid username" });
  }

  const isMatch = await bcrypt.compare(password, data.password);
  if (!isMatch) {
    console.log("Invalid password for user:", email);
    return res.status(400).json({ error: "invalid password" });
  }

  const token = jwt.sign(
    {
      userId: data._id,
      email: data.email,
      name: data.name,
      password: data.password,
    },
    "aman@123",
    {
      expiresIn: "1h",
    }
  );

  res.status(200).json({ token });
});

app.get("/token1", verifyToken, async (req, res) => {
  try {
    const user = await Login.findById(req.userId);
    console.log(user);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({
      message: "You have accessed the protected route!",
      user,
    });
  } catch (error) {
    console.error("Error fetching user:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/token", verifyToken, async (req, res) => {
  const user = await Login.findById(req.userId);
  console.log(user);
  res.json({
    message: "You have accessed the protected route!",
    user,
  });
});

app.post("/reset-password", async (req, res) => {
  const { email, newPassword, token } = req.body;

  const passwordValidationMessage = checkPasswordValidity(newPassword);
  if (passwordValidationMessage) {
    return res.status(400).json({ message: passwordValidationMessage });
  }

  if (!email || !newPassword) {
    return res
      .status(400)
      .json({ message: "Email and new password are required" });
  }
  try {
    const decoded = jwt.verify(token, "aman@123");
    console.log(decoded);
    const users = await Login.find({ email: email });

    if (users.length > 0) {
      const hashedPassword = bcrypt.hashSync(newPassword, 10);
      console.log(hashedPassword);

      users[0].password = hashedPassword;
      await users[0].save();

      return res.status(200).json({ message: "Password reset successfully" });
    } else {
      return res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
});

app.post("/FindData", async (req, res) => {
  const email = req.query.email;
  const page = parseInt(req.query.page) || 2;
  const limit = parseInt(req.query.limit) || 5;

  try {
    let query = {};
    if (email) {
      query = { email: email };
    }

    const result = await Login.find(query)
      .skip((page - 1) * limit)
      .limit(limit);

    console.log(result);
    res.send(result);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/captcha", (req, res) => {
  const captcha = generateCaptcha();
  console.log(captcha);

  const svg = `
      <svg width="200" height="60" xmlns="http://www.w3.org/2000/svg">
          <text x="10" y="40" font-family="Arial" font-size="40" fill="black">${captcha}</text>
      </svg>
  `;

  res.setHeader("Content-Type", "image/svg+xml");
  res.status(200).send(svg);
});

app.post("/verify", (req, res) => {
  const { captcha, userInput } = req.body;

  if (!captcha || !userInput) {
    return res
      .status(400)
      .json({ error: "CAPTCHA and User Input are required" });
  }

  if (captcha.toUpperCase() === userInput.toUpperCase()) {
    res
      .status(200)
      .json({ success: true, message: "CAPTCHA verified successfully" });
  } else {
    res
      .status(400)
      .json({ success: false, error: "CAPTCHA verification failed" });
  }
});

app.post("/photo", upload.single("file"), async (req, res) => {
  try {
    const { name } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).send({ message: "Please upload a file!" });
    }
    // const existingUser = await Admin.findOne({ name });
    // if (existingUser) {
    //   return res.status(400).json({ message: "User already exists" });
    // }
    const filePath = file.path;
    await Admin.create({ name, file: filePath });

    res.send("File uploaded successfully!");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// app.post("/submit", (req, res) => {
//   const name = req.body.name;

//   const response_key = req.body["g-recaptcha-response"];

//   const secret_key = "6Le7xa0pAAAAAAc-HPKePHcmVxY0RjyCIwNmBHb1";

//   const url = `https://www.google.com/recaptcha/api/siteverify?secret=${secret_key}&response=${response_key}`;

//   fetch(url, {
//     method: "post",
//   })
//     .then((response) => response.json())
//     .then((google_response) => {

//       if (google_response.success == true) {

//         return res.send({ response: "Successful" });
//       } else {

//         return res.send({ response: "Failed" });
//       }
//     })
//     .catch((error) => {

//       return res.json({ error });
//     });
// });

// app.get("/12", verifyToken, (req, res) => {
//   res.status(200).json({ message: "Protected route accessed" });
// });

app.post("/upload1", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }
  const filePath = req.file.path;
  try {
    const workbook = xlsx.readFile(filePath);
    const sheetNames = workbook.SheetNames;
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetNames[0]]);
    console.log(data);

    var report = data.map((item) => ({
      name: item.name,
      email: item.email,
      password: item.password,
      newPassword: item.newPassword,
      token: item.token,
    }));
    console.log(report);

    const savedData = await Login.insertMany(report);
    console.log(savedData);

    res.status(200).send({ savedData });
  } catch (error) {
    console.log(error);
    res.status(500).send("Error processing file.");
  }
});

app.get("/download", async (req, res) => {
  const data = await Login.find().exec();
  console.log(data);

  const transformedData = data.map((record) => ({
    name: record.name,
    email: record.email,
    password: record.password,
    newPassword: record.newPassword,
    token: record.token,
  }));

  const workbook = xlsx.utils.book_new();
  const worksheet = xlsx.utils.json_to_sheet(transformedData);
  console.log(worksheet);
  xlsx.utils.book_append_sheet(workbook, worksheet, "loginUser");

  const filesDir = path.join(__dirname, "files");
  if (!fs.existsSync(filesDir)) {
    fs.mkdirSync(filesDir);
  }

  const filePath = path.join(filesDir, "data.xlsx");
  xlsx.writeFile(workbook, filePath);

  res.setHeader("Content-Disposition", "attachment; filename=data.xlsx");
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );

  res.download(filePath, (err) => {
    if (err) {
      res.status(500).send("Could not download the file.");
    } else {
      fs.unlink(filePath, (err) => {
        if (err) console.error("Failed to delete file:", err);
      });
    }
  });
});

app.post("/", (req, res) => {
  res.send("hiii");
});

const countries = [
  {
    name: "Afghanistan",
    alpha2Code: "AF",
    phoneCode: "+93",
    flag: "🇦🇫",
  },
  {
    name: "Albania",
    alpha2Code: "AL",
    phoneCode: "+355",
    flag: "🇦🇱",
  },
  // More countries...
];

app.get("/country-codes", (req, res) => {
  try {
    const countryCodes = countries.map((country) => ({
      name: country.name,
      code: country.alpha2Code,
      phoneExtension: country.phoneCode,
      flag: country.flag,
    }));
    res.status(200).json(countryCodes);
  } catch (error) {
    res.status(500).json({
      message: "Failed to retrieve country codes",
      error: error.message,
    });
  }
});

const axios = require("axios");

app.get("/countries", async (req, res) => {
  try {
    const response = await axios.get("https://restcountries.com/v3.1/all");
    const countries = response.data.map((country) => ({
      name: country.name.common,
      dial_code:
        country.idd.root +
        (country.idd.suffixes ? country.idd.suffixes[0] : ""),
      flag: country.flags.svg || country.flags.png, // Use svg first, fallback to png
    }));
    res.json(countries);
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while fetching country data" });
  }
});

app.get("/countries1", async (req, res) => {
  try {
    const response = await axios.get("https://restcountries.com/v3.1/all");
    const countries = response.data.map((country) => ({
      flag: `https://flagcdn.com/w320/${country.cca2.toLowerCase()}.png`,
      dial_code:
        country.idd.root +
        (country.idd.suffixes ? country.idd.suffixes[0] : ""),
    }));
    console.log("Fetched countries:", countries);
    res.json(countries);
  } catch (error) {
    console.error("Error fetching country data:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching country data" });
  }
});

app.get("/countries", async (req, res) => {
  try {
    const response = await axios.get("https://restcountries.com/v3.1/all");

    const countries = await Promise.all(
      response.data.map(async (country) => {
        const flagUrl = `https://flagcdn.com/w320/${country.cca2.toLowerCase()}.png`;
        const flagBase64 = await getBase64FromUrl(flagUrl);

        return {
          flag: flagBase64,
          dial_code:
            country.idd.root +
            (country.idd.suffixes ? country.idd.suffixes[0] : ""),
        };
      })
    );

    console.log("Fetched countries with base64 flags:", countries);
    res.json(countries);
  } catch (error) {
    console.error("Error fetching country data:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching country data" });
  }
});

// Function to convert image URL to base64
async function getBase64FromUrl(url) {
  const response = await axios.get(url, { responseType: "arraybuffer" });
  const base64 = Buffer.from(response.data, "binary").toString("base64");
  return `data:image/png;base64,${base64}`;
}

// const axios = require('axios');
// const fs = require('fs');
// const { promisify } = require('util');

// const readFileAsync = promisify(fs.readFile);

app.get("/countries12", async (req, res) => {
  try {
    const response = await axios.get("https://restcountries.com/v3.1/all");
    const countries = response.data.map(async (country) => {
      const flagUrl = `https://flagcdn.com/w320/${country.cca2.toLowerCase()}.png`;
      const flagBase64 = await getBase64FromUrl(flagUrl);
      return {
        flag: flagBase64,
        dial_code:
          country.idd.root +
          (country.idd.suffixes ? country.idd.suffixes[0] : ""),
      };
    });
    const countriesWithData = await Promise.all(countries);
    console.log("Fetched countries:", countriesWithData);
    res.json(countriesWithData);
  } catch (error) {
    console.error("Error fetching country data:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching country data" });
  }
});

async function getBase64FromUrl(url) {
  try {
    const response = await axios.get(url, {
      responseType: "arraybuffer",
    });
    const base64 = Buffer.from(response.data, "binary").toString("base64");
    return `data:image/png;base64,${base64}`;
  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
    return null;
  }
}

app.post("/submit", async (req, res) => {
  try {
    console.log(req.body);
    const formData = await FormData.create(req.body);

    const emailSubject = "Thank you for your message!";
    const emailHtml = `
        <p>Hi ${formData.firstName},</p>
        <p>Thank you for reaching out. We received your message:</p>
          <ul>
      <li><strong>First Name:</strong> ${formData.firstName}</li>
        <li><strong>Last Name:</strong> ${formData.lastName}</li>
        <li><strong>Email:</strong> ${formData.email}</li>git
        <li><strong>Country:</strong> ${formData.country}</li>
       <li><strong>Phone:</strong> ${formData.phone}</li>
        <li><strong>Company:</strong> ${formData.company}</li>
      </ul>
        <p>We will get back to you shortly.</p>
        <p>Best regards,</p>
    `;
    // const emailHtml = `
    //   <p><strong>User Details Submitted:</strong></p>
    //   <ul>
    //     <li><strong>First Name:</strong> ${formData.firstName}</li>
    //     <li><strong>Last Name:</strong> ${formData.lastName}</li>
    //     <li><strong>Email:</strong> ${formData.email}</li>
    //     <li><strong>Country:</strong> ${formData.country}</li>
    //     <li><strong>Phone:</strong> ${formData.phone}</li>
    //     <li><strong>Company:</strong> ${formData.company}</li>
    //   </ul>
    // `;

    mailer(
      // subject: emailSubject,
      // html: emailHtml,
      formData.email,
      emailSubject,
      emailHtml
    );

    res
      .status(201)
      .json({ response: formData, message: "Form submitted successfully" });
  } catch (error) {
    console.error("Error submitting form:", error);
    res
      .status(500)
      .json({ error: "An error occurred while submitting the form" });
  }
});

// app.post("/send-otp", (req, res) => {
//   const { phoneNumber } = req.body;
//   const otp = generateOTP();
//   otpStore.set(phoneNumber, otp);

//   function sendSMS(message) {
//     serialPort.write(`AT+CMGF=1\r\n`); // Set SMS mode to text
//     serialPort.write(`AT+CMGS="${phoneNumber}"\r\n`); // Set recipient number
//     serialPort.write(`${message}\r\n`); // Message to send
//     serialPort.write(Buffer.from([26])); // End SMS with Ctrl+Z
//   }
//   parser.on("data", (data) => {
//     console.log("Received:", data);

//     if (data.includes("OK")) {
//       console.log(`SMS sent successfully to ${phoneNumber}`);
//       res.status(200).json({
//         success: true,
//         message: `OTP sent successfully to ${phoneNumber}`,
//       });
//     } else if (data.includes("ERROR")) {
//       console.error("Error sending SMS:", data);
//       res.status(500).json({
//         success: false,
//         message: "Failed to send OTP via SMS",
//         error: data,
//       });
//     }
//   });

//   sendSMS(`Your OTP for verification is: ${otp}`);
// });

// const Modem = require("node-modem");
// // var Modem = require('modem').Modem()

// const modem = new Modem();

// function generateOTP() {
//   return Math.floor(1000 + Math.random() * 9000).toString();
// }

// const otpStore = new Map();

// app.post("/send-otp", async (req, res) => {
//   const { phoneNumber } = req.body;

//   const otp = generateOTP();

//   otpStore.set(phoneNumber, otp);

//   try {
//     await modem.open("/dev/ttyUSB0");

//     // Send SMS
//     await modem.sendSMS(phoneNumber, `Your OTP for verification is: ${otp}`);

//     // Close modem connection
//     await modem.close();

//     console.log(`OTP sent successfully to ${phoneNumber}`);

//     res
//       .status(200)
//       .json({
//         success: true,
//         message: `OTP sent successfully to ${phoneNumber}`,
//       });
//   } catch (error) {
//     console.error("Error sending OTP via SMS:", error);

//     // Close modem connection in case of error
//     await modem.close();

//     res
//       .status(500)
//       .json({
//         success: false,
//         message: "Failed to send OTP via SMS",
//         error: error.message,
//       });
//   }
// });

const redis = require("redis");
const { promisify } = require("util");
const { count } = require("console");

// const redisClient = redis.createClient({
//   host: "localhost",
//   port: 7000,
// });

// redisClient.on("done" ,() => {
//   console.log("done yes")
// })

// redisClient.on("error", (err) => {
//   console.error("Redis client error:", err);
// });

// const redisGetAsync = promisify(redisClient.get).bind(redisClient);
// const redisSetAsync = promisify(redisClient.set).bind(redisClient);

// app.get("/get-flag", async (req, res) => {
//   try {
//     const cachedData = await redisGetAsync("countriesWithFlags");
//     if (cachedData) {
//       console.log("Fetching countries with flags from Redis cache");
//       res.json(JSON.parse(cachedData));
//       return;
//     }

//     const response = await axios.get("https://restcountries.com/v3.1/all");
//     const countries = response.data.map((country) => ({
//       flagUrl: `https://flagcdn.com/w320/${country.cca2.toLowerCase()}.png`,
//       dial_code:
//         country.idd.root +
//         (country.idd.suffixes ? country.idd.suffixes[0] : ""),
//     }));

//     // Fetch flags asynchronously
//     const countriesWithFlags = await Promise.all(
//       countries.map(async (country) => {
//         try {
//           const flagResponse = await axios.get(country.flagUrl, {
//             responseType: "arraybuffer",
//           });
//           const base64 = Buffer.from(flagResponse.data, "binary").toString(
//             "base64"
//           );
//           return {
//             flag: `data:image/png;base64,${base64}`,
//             dial_code: country.dial_code,
//           };
//         } catch (error) {
//           console.error(`Error fetching flag for ${country.dial_code}:`, error);
//           return {
//             flag: null,
//             dial_code: country.dial_code,
//           };
//         }
//       })
//     );

//     await redisSetAsync(
//       "countriesWithFlags",
//       JSON.stringify(countriesWithFlags),
//       "EX",
//       3600
//     );

//     console.log("Fetched countries with flags and stored in Redis");
//     res.json(countriesWithFlags);
//   } catch (error) {
//     console.error("Error fetching country data:", error);
//     res.status(500).json({ error: "Failed to fetch country data" });
//   }
// });

const redisClient = redis.createClient();

const REDIS_KEY_COUNTRIES = "countries";

const apiUrl = "https://restcountries.com/v3.1/all";

async function fetchAndCacheCountries() {
  try {
    redisClient.get(REDIS_KEY_COUNTRIES, async (err, cachedCountries) => {
      if (err) {
        console.error("Error retrieving data from Redis:", err);
        throw err;
      }

      if (cachedCountries) {
        console.log("Fetching countries data from Redis cache...");
        const countries = JSON.parse(cachedCountries);
        return countries; // Return cached data
      } else {
        console.log("Fetching countries data from API...");
        const response = await axios.get(apiUrl);
        const countries = response.data;

        redisClient.setex(REDIS_KEY_COUNTRIES, 3600, JSON.stringify(countries));

        return countries;
      }
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
}

app.get("/api/countries", async (req, res) => {
  try {
    const countries = await fetchAndCacheCountries();
    res.json(countries);
  } catch (error) {
    console.error("Error retrieving countries data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/server", (req, res) => {
  var counter;
  for (let i = 0; i < 1000000000000000000000000; i++) {
    counter++;
  }
  res.status(200).send({ counter });
});



// cron.schedule("*/1 * * * *", async () => {
//   try {
//     const response = await axios.get(
//       "https://api.waqi.info/feed/Seoul/?token=ff593b24529a9291f881feab69d7a137cee8d145"
//     );

//     const airQualityIndex = new AirQualityIndex({
//       status: response.data.status,
//       data: response.data.data,
//     });

//     await airQualityIndex.save();
//     console.log("Data saved successfully!");
//   } catch (error) {
//     console.error("Error fetching or saving data:", error);
//   }
// });




// piRoutes.post("/contactUs", async (req, res) => {
//   try {
//     console.log("Request body:", req.body);
//     const newContact = new ContactUs(req.body);
//     const savedContact = await newContact.save();

//     const email = req.body.emailId;
//     const emailSubject =
//       "Confirmation: Your Enquiry Has Been Successfully Created";
//     const emailHtml = `
//            <p>Hi ${req.body.name} ,</p>
//            <p>Thank you for reaching out. We received your message:</p>
//             <ul>
//                     <li><strong> Name:</strong> ${req.body.name}</li>
//                     <li><strong>Email:</strong> ${req.body.emailId}</li>
//                     <li><strong>Phone:</strong> ${req.body.phoneNumbe}</li>
//                     <li><strong>Subject:</strong> ${req.body.messages}</li>
                   
//            </ul>
//           <p>We will get back to you shortly.</p>
//           <p>Best regards,</p>
//          <img src="cid:logoImage" alt="Company Logo" style="max-width: 100%; height: auto;">`;

//     mailer([email, "contact@neuvays.com"], emailSubject, emailHtml);
//     res.status(201).send(savedContact);
//   } catch (error) {
//     console.log(error);
//     res.status(400).send({ message: error.message });
//   }
// });

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
