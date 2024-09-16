const express = require("express");
const loginUser = require("../models/users");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");

const verifyToken = require("../middleware/authMiddleware");

module.exports = function (app) {
  const apiRoutes = express.Router();

  apiRoutes.post("/register", async (req, res) => {
    const { email, password, role } = req.body;

    const newUser = new loginUser({
      email,
      password,
      role,
    });
    await newUser
      .save()
      .then((user) => res.json(user))
      .catch((err) => res.status(400).json({ error: err.message }));
  });

  apiRoutes.post("/login", async (req, res) => {
    const { email, password } = req.body;
    await loginUser
      .findOne({ where: { email } })
      .then((user) => {
        if (!user) {
          return res.status(400).json({ message: "Invalid email or password" });
        }

        if (user.password !== password) {
          return res.status(400).json({ message: "Invalid email or password" });
        }

        res.status(200).send({ status: "success" });
      })
      .catch((err) => res.status(400).json({ error: err }));
    // try {
    //   const user = await loginUser.findOne({ where: { email } });
    //   console.log(user);
    //   if (user.password !== password) {
    //     return res.status(400).json({ message: "Invalid email or password" });
    //   }
    //   res.status(200).send({ status: "success" });

    //   // const token = jwt.sign(
    //   //   {
    //   //     userId: user.id,
    //   //     email: user.email,
    //   //     password: user.password,
    //   //     role: user.role,
    //   //   },
    //   //   "aman@12",
    //   //   { expiresIn: "1h" }
    //   // );

    //   // res.status(200).send({ status: "success", Token: token });
    // } catch (error) {
    //   res.status(500).json({ error: error.message });
    // }
  });

  apiRoutes.get("/token", verifyToken, async (req, res) => {
    const user = await loginUser.findByPk(req.userId);
    console.log(user);
    res.json({
      message: "You have accessed the protected route!",
      user,
    });
  });

  app.use("/", apiRoutes);
};
