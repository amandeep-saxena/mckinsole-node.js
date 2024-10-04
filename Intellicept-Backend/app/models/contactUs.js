const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const ContactUs = sequelize.define(
  "ContactUs",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      required: true,
      unique: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // email: {
    //   type: DataTypes.STRING,
    //   allowNull: false,
    //   validate: {
    //     isEmail: false,
    //   },
    // },
    message: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "contact",
  }
);

(async () => {
  try {
    await sequelize.sync({ alter: true });
    // console.log("Database synchronized");
  } catch (error) {
    console.error(
      "Error synchronizing database:",
      error.errors || error.message || error
    );
  }
})();

module.exports = ContactUs;
