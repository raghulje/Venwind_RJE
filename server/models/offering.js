"use strict";

module.exports = (sequelize, DataTypes) => {
  const Offering = sequelize.define(
    "Offering",
    {
      title: { type: DataTypes.STRING, allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: false },
      metric: { type: DataTypes.STRING, allowNull: true },
      icon: { type: DataTypes.STRING, allowNull: true },
      gradient: { type: DataTypes.STRING, allowNull: true },
      unit: { type: DataTypes.STRING, allowNull: true },
      color: { type: DataTypes.STRING, allowNull: true },
      order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    { tableName: "offerings", underscored: true }
  );

  return Offering;
};


