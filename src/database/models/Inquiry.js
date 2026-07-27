// models/Inquiry.js
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Inquiry extends Model {
    static associate(models) {
      Inquiry.belongsTo(models.Property, {
        foreignKey: 'property_id',
        as: 'property'
      });
    }
  }

  Inquiry.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    property_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('general', 'group_bookings', 'events', 'meetings'),
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    party_size: {
      type: DataTypes.INTEGER
    },
    preferred_date: {
      type: DataTypes.DATE
    },
    status: {
      type: DataTypes.ENUM('new', 'contacted', 'closed'),
      defaultValue: 'new'
    }
  }, {
    sequelize,
    modelName: 'Inquiry',
    tableName: 'inquiries',
    timestamps: true,
    underscored: true
  });

  return Inquiry;
};