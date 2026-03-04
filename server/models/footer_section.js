"use strict";

module.exports = (sequelize, DataTypes) => {
  const FooterSection = sequelize.define(
    "FooterSection",
    {
      title: { type: DataTypes.STRING },
      subtitle: { type: DataTypes.TEXT },
      ctaText: { type: DataTypes.STRING },
      ctaIcon: { type: DataTypes.STRING },
      backgroundImageUrl: { type: DataTypes.TEXT },
      isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    },
    {
      tableName: "sustainability_footer_section",
      underscored: true,
    }
  );

  return FooterSection;
};


