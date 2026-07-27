
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class CancellationPolicy extends Model {
    static associate(models) {
      CancellationPolicy.belongsTo(models.Property, {
        foreignKey: 'property_id',
        as: 'property'
      });
      CancellationPolicy.hasMany(models.RatePlan, {
        foreignKey: 'cancellation_policy_id',
        as: 'ratePlans'
      });
      CancellationPolicy.hasMany(models.Booking, {
        foreignKey: 'cancellation_policy_id',
        as: 'bookings'
      });
    }
  }


  CancellationPolicy.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    property_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    tiers: {
      type: DataTypes.JSONB,
      allowNull: false
    },
    deposit_pct: {
      type: DataTypes.DECIMAL(5, 2)
    },
    is_default: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'CancellationPolicy',
    tableName: 'cancellation_policies',
    timestamps: true,
    underscored: true
  });

  return CancellationPolicy;
};