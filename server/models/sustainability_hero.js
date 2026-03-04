"use strict";

module.exports = (sequelize, DataTypes) => {
  const SustainabilityHero = sequelize.define(
    "SustainabilityHero",
    {
      title: { type: DataTypes.STRING, allowNull: false },
      description: { type: DataTypes.TEXT },
      backgroundImage: { type: DataTypes.TEXT },
      isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    },
    {
      tableName: "sustainability_hero",
      underscored: true,
    }
  );

  return SustainabilityHero;
};


