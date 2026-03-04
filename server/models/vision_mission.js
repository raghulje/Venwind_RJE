"use strict";

module.exports = (sequelize, DataTypes) => {
  const VisionMission = sequelize.define(
    "VisionMission",
    {
      sectionTitle: { type: DataTypes.STRING },
      sectionSubtitle: { type: DataTypes.STRING },
      visionTitle: { type: DataTypes.STRING },
      visionSubtitle: { type: DataTypes.STRING },
      visionDescription: { type: DataTypes.TEXT },
      visionPoints: { type: DataTypes.JSON },
      missionTitle: { type: DataTypes.STRING },
      missionSubtitle: { type: DataTypes.STRING },
      missionPoints: { type: DataTypes.JSON },
      stats: { type: DataTypes.JSON },
      isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    },
    {
      tableName: "sustainability_vision_mission",
      underscored: true,
    }
  );

  return VisionMission;
};


