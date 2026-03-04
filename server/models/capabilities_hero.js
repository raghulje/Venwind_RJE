"use strict";

module.exports = (sequelize, DataTypes) => {
  const CapabilitiesHero = sequelize.define(
    "CapabilitiesHero",
    {
      title: { type: DataTypes.STRING, allowNull: false },
      subtitle: { type: DataTypes.STRING },
      description: { type: DataTypes.TEXT },
      subDescription: { type: DataTypes.TEXT },
      backgroundImage: { type: DataTypes.TEXT, allowNull: false },
      isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    },
    {
      tableName: "capabilities_hero",
      underscored: true,
    }
  );

  return CapabilitiesHero;
};


