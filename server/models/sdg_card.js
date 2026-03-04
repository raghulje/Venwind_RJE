"use strict";

module.exports = (sequelize, DataTypes) => {
  const SdgCard = sequelize.define(
    "SdgCard",
    {
      number: { type: DataTypes.INTEGER, allowNull: false },
      title: { type: DataTypes.STRING, allowNull: false },
      contribution: { type: DataTypes.TEXT },
      icon: { type: DataTypes.STRING },
      color: { type: DataTypes.STRING },
      order: { type: DataTypes.INTEGER, defaultValue: 0 },
      isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    },
    {
      tableName: "sustainability_sdg_card",
      underscored: true,
    }
  );

  return SdgCard;
};


