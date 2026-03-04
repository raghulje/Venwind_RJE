"use strict";

module.exports = (sequelize, DataTypes) => {
  const SustainabilityHeart = sequelize.define(
    "SustainabilityHeart",
    {
      mainTitle: { type: DataTypes.STRING },
      mainSubtitle: { type: DataTypes.TEXT },
      // JSON fields to store arrays of objects
      sections: { type: DataTypes.JSON, defaultValue: [] },
      commitments: { type: DataTypes.JSON, defaultValue: [] },
      isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    },
    {
      tableName: "sustainability_heart",
      underscored: true,
    }
  );

  return SustainabilityHeart;
};


