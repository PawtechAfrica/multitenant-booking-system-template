// models/EventType.js
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class EventType extends Model {
    static associate(models) {
      EventType.belongsTo(models.Property, {
        foreignKey: 'property_id',
        as: 'property'
      });
    }
  }

  EventType.init({
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
    image_url: {
      type: DataTypes.STRING
    },
    icon: {
      type: DataTypes.STRING
    },
    sort_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'EventType',
    tableName: 'event_types',
    timestamps: true,
    underscored: true
  });

  return EventType;
};