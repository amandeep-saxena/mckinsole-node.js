const express = require("express");

const digitalMarketing = require("../models/digitalMarketing");

module.exports = function (app) {
  const apiRoutes = express.Router();

  app.post("/addShop", (req, res) => {
    res.send(req.body);
  });

  apiRoutes.post("/digitalMarketing", async (req, res) => {
    try {
      const data = await digitalMarketing.create(req.body);
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  apiRoutes.get("/get-digitalMarketing", async (req, res) => {
    try {
      const data = await digitalMarketing.findAll(); 
      res.status(200).json(data); 
    } catch (error) {
      res.status(500).json({ error: error.message }); 
    }
  });

  app.use("/", apiRoutes);
};
