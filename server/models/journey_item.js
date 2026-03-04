"use strict";

module.exports = (sequelize, DataTypes) => {
  const JourneyItem = sequelize.define(
    "JourneyItem",
    {
      title: { type: DataTypes.STRING, allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: false },
      year: { type: DataTypes.STRING, allowNull: true },
      image: { type: DataTypes.TEXT, allowNull: true },
      color: { type: DataTypes.STRING, allowNull: true },
      order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    { tableName: "journey_items", underscored: true }
  );
  return JourneyItem;
};


