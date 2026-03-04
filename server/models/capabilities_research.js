"use strict";

module.exports = (sequelize, DataTypes) => {
  const CapabilitiesResearch = sequelize.define(
    "CapabilitiesResearch",
    {
      title: { type: DataTypes.STRING, allowNull: false },
      description: { type: DataTypes.TEXT },
      image: { type: DataTypes.TEXT },
      apiCard: { type: DataTypes.JSON },
      fdfCard: { type: DataTypes.JSON },
      promise: { type: DataTypes.JSON },
      isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    },
    {
      tableName: "capabilities_research",
      underscored: true,
    }
  );

  return CapabilitiesResearch;
};


