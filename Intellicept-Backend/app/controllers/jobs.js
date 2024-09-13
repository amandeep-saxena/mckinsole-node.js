const express = require("express");
const Jobs = require("../models/jobs");
const jobs = require("../models/jobs");

module.exports = function (app) {
  const apiRoutes = express.Router();

  apiRoutes.post("/addJob", async (req, res) => {
    try {
      const jobData = {
        job_title: req.body.job_title,
        job_description: req.body.job_description,
        start_application_date: req.body.start_application_date,
        job_location: req.body.job_location,
        no_of_position: req.body.no_of_position,
        job_created_by: req.body.job_created_by,
        isActive: req.body.isActive,
      };

      const data = await Jobs.create(jobData);
      res.status(200).json("Job Added Successfully");
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  apiRoutes.get("/get-jobs", async (req, res) => {
    try {
      const jobs = await Jobs.findAll();
      res.status(200).json(jobs);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  apiRoutes.get("/jobs/:id", async (req, res) => {
    try {
      const job = await Jobs.findByPk(req.params.id);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      res.status(200).json(job);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  apiRoutes.post("/updateJobs/:id", async (req, res) => {
    try {
      const jobId = req.params.id;

      const updatedJob = await jobs.update(
        {
          job_title: req.body.job_title,
          job_description: req.body.job_description,
          start_application_date: req.body.start_application_date,
          job_location: req.body.job_location,
          no_of_position: req.body.no_of_position,
          job_created_by: req.body.job_created_by,
          isActive: req.body.isActive,
        },
        { where: { id: jobId } }
      );

      if (updatedJob[0] > 0) {
        res.status(200).json({ message: "Job updated successfully" });
      } else {
        res.status(404).json({ message: "Job not found" });
      }
    } catch (error) {
      res
        .status(500)
        .json({ error: "An error occurred while updating the job" });
    }
  });

  // apiRoutes.post("/deleteJob/:id", async (req, res) => {
  //   try {
  //     const jobId = req.params.id;

  //     const deletedJob = await Jobs.destroy({
  //       where: { id: jobId },
  //       // force: false,
  //       isActive : false
  //     });

  //     if (deletedJob > 0) {
  //       res
  //         .status(200)
  //         .json({ message: "Job deleted successfully", data: deletedJob });
  //     } else {
  //       res.status(404).json({ message: "Job not found" });
  //     }
  //   } catch (error) {
  //     res
  //       .status(500)
  //       .json({ error: "An error occurred while deleting the job" });
  //   }
  // });

  apiRoutes.post("/deleteJob/:id", async (req, res) => {
    try {
      const jobId = req.params.id;

      const [updated] = await Jobs.update(
        { isActive: false },
        { where: { id: jobId } }
      );

      if (updated) {
        const updatedJob = await Jobs.findByPk(jobId);
        // console.log(updatedJob);
        if (updatedJob) {
          res.status(200).json({
            message: "Job marked as inactive successfully",
            data: updatedJob,
          });
        } else {
          res.status(404).json({ message: "Job not found" });
        }
      } 
      // const jobId = req.params.id;

      // const updatedJob = await Jobs.update(
      //   { isActive: false },
      //   { where: { id: jobId } }
      // );

      // if (updatedJob[0] > 0) {
      //   res
      //     .status(200)
      //     .json({
      //       message: "Job marked as inactive successfully",
      //       data: updatedJob,
      //     });
      // } else {
      //   res.status(404).json({ message: "Job not found" });
      // }
    } catch (error) {
      res
        .status(500)
        .json({ error: "An error occurred while marking the job as inactive" });
    }
  });

  app.use("/", apiRoutes);
};
