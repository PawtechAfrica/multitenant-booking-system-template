// models/Refund.js
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Refund extends Model {
    static associate(models) {
      Refund.belongsTo(models.Booking, {
        foreignKey: 'booking_id',
        as: 'booking'
      });
      Refund.belongsTo(models.Payment, {
        foreignKey: 'payment_id',
        as: 'payment'
      });
      Refund.belongsTo(models.User, {
        foreignKey: 'processed_by',
        as: 'processedBy'
      });
    }
  }

  Refund.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    booking_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    payment_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    reason: {
      type: DataTypes.TEXT
    },
    status: {
      type: DataTypes.ENUM('requested', 'processing', 'completed', 'rejected'),
      defaultValue: 'requested'
    },
    processed_by: {
      type: DataTypes.UUID,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Refund',
    tableName: 'refunds',
    timestamps: true,
    underscored: true
  });

  return Refund;
};