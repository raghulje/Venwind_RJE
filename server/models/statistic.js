"use strict";

module.exports = (sequelize, DataTypes) => {
  const Statistic = sequelize.define(
    "Statistic",
    {
      title: { type: DataTypes.STRING, allowNull: false },
      value: { type: DataTypes.STRING, allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: false },
      image: { type: DataTypes.TEXT, allowNull: false },
      color: { type: DataTypes.STRING, allowNull: true },
      order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    { tableName: "statistics", underscored: true }
  );
  return Statistic;
};


