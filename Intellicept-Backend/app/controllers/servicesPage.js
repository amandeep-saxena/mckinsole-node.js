const express = require("express");
const ServicesPage = require("../models/servicesPage");

module.exports = function (app) {
  const apiRoutes = express.Router();

  apiRoutes.post("/data", (req, res) => {
    console.log(req.body);
    res.send(req.body);
  });

  apiRoutes.post("/service", async (req, res) => {
    try {
      const data = await ServicesPage.create(req.body);
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  apiRoutes.get("/get-serviceData", async (req, res) => {
    try {
      const data = await ServicesPage.findAll(); 
      res.status(200).json(data); 
    } catch (error) {
      res.status(500).json({ error: error.message }); 
    }
  });

  app.use("/", apiRoutes);
};
