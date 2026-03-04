"use strict";

module.exports = (sequelize, DataTypes) => {
  const DigitalSolution = sequelize.define(
    "DigitalSolution",
    {
      cardTitle: { type: DataTypes.STRING, allowNull: false },
      cardSubtitle: { type: DataTypes.STRING },
      cardDescription: { type: DataTypes.TEXT },
      order: { type: DataTypes.INTEGER, defaultValue: 0 },
      isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    },
    {
      tableName: "digital_solutions",
      underscored: true,
    }
  );

  return DigitalSolution;
};
