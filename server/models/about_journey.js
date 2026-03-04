"use strict";

module.exports = (sequelize, DataTypes) => {
  const AboutJourney = sequelize.define(
    "AboutJourney",
    {
      title: { type: DataTypes.STRING, allowNull: false },
      summary: { type: DataTypes.TEXT, allowNull: true },
      image: { type: DataTypes.TEXT, allowNull: true }, // Keep for backward compatibility
      images: { type: DataTypes.JSON, allowNull: true }, // New field for multiple images
      isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    { tableName: "about_journey", underscored: true }
  );
  return AboutJourney;
};
