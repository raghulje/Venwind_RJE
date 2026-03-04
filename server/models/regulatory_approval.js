"use strict";

module.exports = (sequelize, DataTypes) => {
  const RegulatoryApproval = sequelize.define(
    "RegulatoryApproval",
    {
      title: { type: DataTypes.STRING, allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: false },
      image: { type: DataTypes.TEXT, allowNull: true },
      link: { type: DataTypes.TEXT, allowNull: true },
      color: { type: DataTypes.STRING, allowNull: true },
      order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    { tableName: "regulatory_approvals", underscored: true }
  );
  return RegulatoryApproval;
};


