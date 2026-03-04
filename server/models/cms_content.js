"use strict";

module.exports = (sequelize, DataTypes) => {
  const CmsContent = sequelize.define(
    "CmsContent",
    {
      page: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: "Page identifier (home, about, products, technology, sustainability, careers, contact)",
      },
      section: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: "Section identifier (hero, stats, differentiators, etc.)",
      },
      data: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: {},
        comment: "JSON data for the section",
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "cms_content",
      underscored: true,
      indexes: [
        {
          unique: true,
          fields: ["page", "section"],
          name: "unique_page_section",
        },
      ],
    }
  );

  return CmsContent;
};

