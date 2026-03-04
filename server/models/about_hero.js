"use strict";

module.exports = (sequelize, DataTypes) => {
  const AboutHero = sequelize.define(
    "AboutHero",
    {
      title: { type: DataTypes.STRING, allowNull: false },
      subtitle: { type: DataTypes.TEXT, allowNull: true },
      description: { type: DataTypes.TEXT, allowNull: true },
      backgroundImage: { type: DataTypes.TEXT, allowNull: false },
      // Array of logo cards: [{ name, logoUrl, link }]
      logoCards: { type: DataTypes.JSON, allowNull: true },
      isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    { tableName: "about_hero", underscored: true }
  );
  return AboutHero;
};


