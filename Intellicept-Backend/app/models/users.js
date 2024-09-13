const { DataTypes } = require("sequelize");
const sequelize = require("../config/db"); // Adjust path to your config

const loginUser = sequelize.define(
  "UserRegister",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      // unique: true, 
      // validate: {
      //   isEmail: true, 
      // },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING,
    //   defaultValue: "Admin",
    },
  },
  {
    tableName: "UserRegister",
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

module.exports = loginUser;
