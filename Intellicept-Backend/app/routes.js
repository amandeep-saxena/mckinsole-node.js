

module.exports = function (app) {
  require("./controllers/servicesPage")(app);
  require("./controllers/digitalMarketing")(app);
  require("./controllers/contactUs")(app);
  require("./controllers/careerPage")(app);
  require("./controllers/users")(app);
  require("./controllers/jobs")(app);
};
