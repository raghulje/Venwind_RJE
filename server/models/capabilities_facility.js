"use strict";

module.exports = (sequelize, DataTypes) => {
  const CapabilitiesFacility = sequelize.define(
    "CapabilitiesFacility",
    {
      name: { type: DataTypes.STRING, allowNull: false },
      type: { type: DataTypes.STRING, allowNull: false },
      location: { type: DataTypes.STRING },
      capacity: { type: DataTypes.STRING },
      established: { type: DataTypes.STRING },
      image: { type: DataTypes.TEXT },
      capabilities: { type: DataTypes.JSON },
      approvals: { type: DataTypes.JSON },
      color: { type: DataTypes.STRING },
      order: { type: DataTypes.INTEGER, defaultValue: 0 },
      isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    },
    {
      tableName: "capabilities_facility",
      underscored: true,
    }
  );

  return CapabilitiesFacility;
};


