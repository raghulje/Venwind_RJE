"use strict";

module.exports = (sequelize, DataTypes) => {
  const Policy = sequelize.define(
    "Policy",
    {
      title: { type: DataTypes.STRING, allowNull: false },
      description: { type: DataTypes.TEXT },
      icon: { type: DataTypes.STRING },
      color: { type: DataTypes.STRING },
      order: { type: DataTypes.INTEGER, defaultValue: 0 },
      isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    },
    {
      tableName: "sustainability_policy",
      underscored: true,
    }
  );

  return Policy;
};


