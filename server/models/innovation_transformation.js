"use strict";

module.exports = (sequelize, DataTypes) => {
  const InnovationTransformation = sequelize.define(
    "InnovationTransformation",
    {
      sectionTitle: { type: DataTypes.STRING, allowNull: false },
      sectionDescription: { type: DataTypes.TEXT },
      isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    },
    {
      tableName: "innovation_transformation",
      underscored: true,
    }
  );

  return InnovationTransformation;
};
