// models/RatePlan.js
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class RatePlan extends Model {
    static associate(models) {
      RatePlan.belongsTo(models.Property, {
        foreignKey: 'property_id',
        as: 'property'
      });
      RatePlan.belongsTo(models.RoomType, {
        foreignKey: 'room_type_id',
        as: 'roomType'
      });
      RatePlan.belongsTo(models.CancellationPolicy, {
        foreignKey: 'cancellation_policy_id',
        as: 'cancellationPolicy'
      });
      RatePlan.hasMany(models.Booking, {
        foreignKey: 'rate_plan_id',
        as: 'bookings'
      });
    }
  }

  RatePlan.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    property_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    room_type_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    price_override: {
      type: DataTypes.DECIMAL(10, 2)
    },
    cancellation_policy_id: {
      type: DataTypes.UUID,
      allowNull: true
    },
    valid_from: {
      type: DataTypes.DATE
    },
    valid_to: {
      type: DataTypes.DATE
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'RatePlan',
    tableName: 'rate_plans',
    timestamps: true,
    underscored: true
  });

  return RatePlan;
};