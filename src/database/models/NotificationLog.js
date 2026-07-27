// models/NotificationLog.js
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class NotificationLog extends Model {
    static associate(models) {
      NotificationLog.belongsTo(models.Booking, {
        foreignKey: 'booking_id',
        as: 'booking'
      });
    }
  }

  NotificationLog.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    booking_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    channel: {
      type: DataTypes.ENUM('email', 'sms', 'whatsapp'),
      allowNull: false
    },
    template: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('queued', 'sent', 'failed'),
      defaultValue: 'queued'
    },
    sent_at: {
      type: DataTypes.DATE
    },
    payload: {
      type: DataTypes.JSONB
    }
  }, {
    sequelize,
    modelName: 'NotificationLog',
    tableName: 'notifications_log',
    timestamps: true,
    underscored: true
  });

  return NotificationLog;
};