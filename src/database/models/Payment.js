// models/Payment.js
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Payment extends Model {
    static associate(models) {
      Payment.belongsTo(models.Booking, {
        foreignKey: 'booking_id',
        as: 'booking'
      });
      Payment.hasMany(models.Refund, {
        foreignKey: 'payment_id',
        as: 'refunds'
      });
    }
  }

  Payment.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    booking_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    provider: {
      type: DataTypes.ENUM('mpesa', 'cash', 'card'),
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('deposit', 'balance', 'full'),
      allowNull: false
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    currency: {
      type: DataTypes.STRING(3),
      defaultValue: 'KES'
    },
    status: {
      type: DataTypes.ENUM('initiated', 'pending', 'completed', 'failed', 'reversed'),
      defaultValue: 'initiated'
    },
    provider_reference: {
      type: DataTypes.STRING
    },
    mpesa_receipt_number: {
      type: DataTypes.STRING
    },
    phone_number: {
      type: DataTypes.STRING
    },
    raw_callback: {
      type: DataTypes.JSONB
    },
    initiated_at: {
      type: DataTypes.DATE
    },
    completed_at: {
      type: DataTypes.DATE
    }
  }, {
    sequelize,
    modelName: 'Payment',
    tableName: 'payments',
    timestamps: true,
    underscored: true
  });

  return Payment;
};