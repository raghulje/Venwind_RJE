"use strict";

module.exports = (sequelize, DataTypes) => {
  const ResearchInnovation = sequelize.define(
    "ResearchInnovation",
    {
      cardTitle: { type: DataTypes.STRING, allowNull: false },
      cardSubtitle: { type: DataTypes.STRING },
      cardDescription: { type: DataTypes.TEXT },
      order: { type: DataTypes.INTEGER, defaultValue: 0 },
      isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    },
    {
      tableName: "research_innovations",
      underscored: true,
    }
  );

  return ResearchInnovation;
};
