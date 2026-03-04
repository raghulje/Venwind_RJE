"use strict";

module.exports = (sequelize, DataTypes) => {
  const HeroSlide = sequelize.define(
    "HeroSlide",
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      image: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      tableName: "hero_slides",
      underscored: true,
    }
  );

  return HeroSlide;
};


