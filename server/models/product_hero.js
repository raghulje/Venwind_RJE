const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ProductHero = sequelize.define('ProductHero', {
    backgroundImage: { type: DataTypes.TEXT, allowNull: true },
    overlayFrom: { type: DataTypes.STRING, allowNull: true, defaultValue: 'rgba(0,0,0,0.5)' },
    overlayTo: { type: DataTypes.STRING, allowNull: true, defaultValue: 'rgba(0,0,0,0.3)' },
    titleLine1: { type: DataTypes.STRING, allowNull: true },
    titleLine2: { type: DataTypes.STRING, allowNull: true },
    subtitle: { type: DataTypes.TEXT, allowNull: true },
    highlightText: { type: DataTypes.STRING, allowNull: true },
    description: { type: DataTypes.TEXT, allowNull: true },
    titleColor: { type: DataTypes.STRING, allowNull: true, defaultValue: '#ffffff' },
    subtitleColor: { type: DataTypes.STRING, allowNull: true, defaultValue: 'rgba(255,255,255,0.9)' },
    descriptionColor: { type: DataTypes.STRING, allowNull: true, defaultValue: 'rgba(255,255,255,0.8)' },
    aosType: { type: DataTypes.STRING, allowNull: true },
    aosDuration: { type: DataTypes.INTEGER, allowNull: true },
    aosDelay: { type: DataTypes.INTEGER, allowNull: true },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  }, {
    tableName: 'product_hero',
  });

  return ProductHero;
};

