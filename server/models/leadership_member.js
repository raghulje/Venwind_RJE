"use strict";

module.exports = (sequelize, DataTypes) => {
  const LeadershipMember = sequelize.define(
    "LeadershipMember",
    {
      name: { type: DataTypes.STRING, allowNull: false },
      position: { type: DataTypes.STRING, allowNull: false },
      category: { type: DataTypes.STRING, allowNull: false }, // Advisory Board | Technical Leadership Team | Management Team
      description: { type: DataTypes.TEXT, allowNull: true },
      achievementsJson: { type: DataTypes.TEXT, allowNull: true }, // JSON string array
      experience: { type: DataTypes.STRING, allowNull: true },
      education: { type: DataTypes.STRING, allowNull: true },
      image: { type: DataTypes.TEXT, allowNull: true }, // Store base64 data URL
      color: { type: DataTypes.STRING, allowNull: true },
      order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    { tableName: "leadership_members", underscored: true }
  );
  return LeadershipMember;
};


