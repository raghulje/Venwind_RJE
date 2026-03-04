"use strict";

module.exports = (sequelize, DataTypes) => {
  const AboutVisionMission = sequelize.define(
    "AboutVisionMission",
    {
      visionTitle: { type: DataTypes.STRING, allowNull: false },
      visionDescription: { type: DataTypes.TEXT, allowNull: true },
      visionImage: { type: DataTypes.TEXT, allowNull: true },
      missionTitle: { type: DataTypes.STRING, allowNull: false },
      missionImage: { type: DataTypes.TEXT, allowNull: true },
      missionPointsJson: { type: DataTypes.TEXT, allowNull: true }, // JSON string array
      isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    { tableName: "about_vision_mission", underscored: true }
  );
  return AboutVisionMission;
};


