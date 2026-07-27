// models/Offer.js
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Offer extends Model {
    static associate(models) {
      Offer.belongsTo(models.Property, {
        foreignKey: 'property_id',
        as: 'property'
      });
    }
  }

  Offer.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    property_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    discount_type: {
      type: DataTypes.ENUM('percentage', 'fixed_amount'),
      allowNull: false
    },
    discount_value: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    valid_from: {
      type: DataTypes.DATE
    },
    valid_to: {
      type: DataTypes.DATE
    },
    image_url: {
      type: DataTypes.STRING
    },
    terms: {
      type: DataTypes.TEXT
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'Offer',
    tableName: 'offers',
    timestamps: true,
    underscored: true
  });

  return Offer;
};