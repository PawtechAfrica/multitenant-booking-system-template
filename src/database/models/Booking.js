// models/Booking.js
const { Model, DataTypes } = require('sequelize')

module.exports = sequelize => {
  class Booking extends Model {
    static associate (models) {
      Booking.belongsTo(models.Property, {
        foreignKey: 'property_id',
        as: 'property'
      })
      Booking.belongsTo(models.RoomType, {
        foreignKey: 'room_type_id',
        as: 'roomType'
      })
      Booking.belongsTo(models.RatePlan, {
        foreignKey: 'rate_plan_id',
        as: 'ratePlan'
      })
      Booking.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      })
      Booking.hasMany(models.BookingRoom, {
        foreignKey: 'booking_id',
        as: 'bookingRooms'
      })
      Booking.hasMany(models.Payment, {
        foreignKey: 'booking_id',
        as: 'payments'
      })
      Booking.hasMany(models.Refund, {
        foreignKey: 'booking_id',
        as: 'refunds'
      })
      Booking.hasMany(models.NotificationLog, {
        foreignKey: 'booking_id',
        as: 'notifications'
      })
      Booking.belongsTo(models.CancellationPolicy, {
        foreignKey: 'cancellation_policy_id',
        as: 'cancellationPolicy'
      })
    }
  }

  Booking.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      booking_code: {
        type: DataTypes.STRING(10),
        allowNull: false,
        unique: true
      },
      property_id: {
        type: DataTypes.UUID,
        allowNull: false
      },
      room_type_id: {
        type: DataTypes.UUID,
        allowNull: false
      },
      rate_plan_id: {
        type: DataTypes.UUID,
        allowNull: true
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: true
      },
      guest_first_name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      guest_last_name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      guest_email: {
        type: DataTypes.STRING,
        allowNull: false
      },
      guest_phone: {
        type: DataTypes.STRING
      },
      check_in_date: {
        type: DataTypes.DATE,
        allowNull: false
      },
      check_out_date: {
        type: DataTypes.DATE,
        allowNull: false
      },
      num_adults: {
        type: DataTypes.INTEGER,
        defaultValue: 1
      },
      num_children: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      num_rooms: {
        type: DataTypes.INTEGER,
        defaultValue: 1
      },
      special_requests: {
        type: DataTypes.TEXT
      },
      status: {
        type: DataTypes.ENUM(
          'pending_payment',
          'confirmed',
          'checked_in',
          'checked_out',
          'cancelled',
          'no_show',
          'expired'
        ),
        defaultValue: 'pending_payment'
      },
      subtotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      deposit_required: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
      },
      amount_paid: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
      },
      balance_due: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
      },
      cancellation_policy_id: {
        type: DataTypes.UUID,
        allowNull: true
      },
      cancellation_deadline_at: {
        type: DataTypes.DATE
      },
      source: {
        type: DataTypes.ENUM('web', 'whatsapp', 'admin_manual', 'phone'),
        defaultValue: 'web'
      },
      expires_at: {
        type: DataTypes.DATE
      }
    },
    {
      sequelize,
      modelName: 'Booking',
      tableName: 'bookings',
      timestamps: true,
      underscored: true
    }
  )

  return Booking
}
