const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const digitalMarketing = sequelize.define(
  "digitalMarketing",
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
    userPhone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    userMessage: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "digitalMarketing",
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

module.exports = digitalMarketing;
