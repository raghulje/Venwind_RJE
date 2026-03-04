"use strict";

module.exports = (sequelize, DataTypes) => {
  const SocialSection = sequelize.define(
    "SocialSection",
    {
      sectionTitle: { type: DataTypes.STRING },
      sectionDescription: { type: DataTypes.TEXT },
      isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
      csrCards: { type: DataTypes.JSON },
      csrImpactTitle: { type: DataTypes.STRING },
      csrImpactDescription: { type: DataTypes.TEXT },
      csrImpactItems: { type: DataTypes.JSON },
    },
    {
      tableName: "sustainability_social_section",
      underscored: true,
    }
  );

  return SocialSection;
};


