const express = require("express");
const app = express();
const port = 7000;
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const Login = require("../project/model/User");
const bodyParser = require("body-parser");
const verifyToken = require("./middleware/authMiddleware");
const jwt = require("jsonwebtoken");

// const Admin = require("./model/Admin");

app.use(express.json());
app.use(bodyParser.json());

//database  ///
mongoose
  .connect("mongodb://127.0.0.1:27017/curd", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected! successfull-------- "));

function generateCaptcha() {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789#@$%&*";
  let captcha = "";

  for (let i = 0; i < 6; i++) {
    captcha += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return captcha;
}

app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  // if (!name || !email || !password) {
  //   return res.status(400).send({ message: "Invalid request body" });
  // }

  if (!name) {
    return res.status(400).json({ message: "Nman Filed req.." });
  }

  if (!email) {
    return res.status(400).json({ message: "email Filed req.." });
  }

  if (!password) {
    return res.status(400).json({ message: "password Filed req.." });
  }

  const existingUser = await Login.findOne({ email });
  if (existingUser) {
    return res.status(400).send({ message: "User already exists" });
  }

  const user = new Login({
    name,
    email,
    password: bcrypt.hashSync(req.body.password, 8),
  });
  await user.save();

  res.status(201).send(user);

  //   Generate JWT token
  //   const token = jwt.sign({ userId: user._id, email: user.email }, 'aman@12', { expiresIn: '1h' });

  //      res.status(201).json({ token });
});

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
    { userId: data._id, email: data.email, name: data.name },
    "aman@112",
    {
      expiresIn: "1h",
    }
  );
  res.status(200).json({ token });

});


app.get("/token1", verifyToken, async (req, res) => {
  try {
    const user = await Login.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({
      message: "You have accessed the protected route!",
      user,
    });
  } catch (error) {
    console.error('Error fetching user:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// app.get("/token", verifyToken, (req, res) => {
//   res.json({
//     message: "You have accessed the protected route!",
//     userId: req.userId,
//   });
// });

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

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
