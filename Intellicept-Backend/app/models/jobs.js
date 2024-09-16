const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const jobs = sequelize.define(
  "jobs",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: false,
      required: false,
      unique: true,
      allowNull: true,
    },
    job_title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    job_description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    start_application_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    end_application_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    job_location: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    no_of_position: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    job_created_by: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: "jobs",
  }
);

(async () => {
  try {
    await sequelize.sync({alter:true});
    // console.log("Database synchronized");
  } catch (error) {
    console.error("Error synchronizing database:", error);
  }
})();

module.exports = jobs;
