"use strict";
const { Model } = require("sequelize");
const { v4: uuidv4 } = require("uuid");

module.exports = (sequelize, DataTypes) => {
  class LoginHistory extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      LoginHistory.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "user",
      });
    }
  }
  LoginHistory.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: uuidv4,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.UUID,
      },
      status: {
        type: DataTypes.ENUM("Logged-In", "Logged-Out"),
        defaultValue: "Logged-In",
      },
    },
    {
      sequelize,
      modelName: "LoginHistory",
      createdAt: "login_time",
      updatedAt: "logout_time",
    }
  );
  return LoginHistory;
};
