const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const ServicesPage = sequelize.define(
  "ServicesPage",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      required: true,
      unique: true,
      allowNull: false,
    },
    userName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    userEmail: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  
    userMessage: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "ServicesPage",
  }
);

(async () => {
  try {
    await sequelize.sync();
    // console.log("Database synchronized");
  } catch (error) {
    console.error("Error synchronizing database:", error);
  }
})();

module.exports = ServicesPage;
