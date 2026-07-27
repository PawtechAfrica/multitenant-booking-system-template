// models/User.js
const { Model, DataTypes } = require('sequelize')

module.exports = sequelize => {
  class User extends Model {
    static associate (models) {
      User.belongsTo(models.Property, {
        foreignKey: 'property_id',
        as: 'property'
      })
      User.hasMany(models.Booking, {
        foreignKey: 'user_id',
        as: 'bookings'
      })
      User.hasMany(models.AuditLog, {
        foreignKey: 'actor_user_id',
        as: 'auditLogs'
      })
      User.hasMany(models.MediaAsset, {
        foreignKey: 'uploaded_by',
        as: 'uploadedMedia'
      })
      User.hasMany(models.Refund, {
        foreignKey: 'processed_by',
        as: 'processedRefunds'
      })
      User.hasMany(models.RefreshToken, {
        foreignKey: 'user_id',
        as: 'refreshTokens'
      })
    }
  }

  User.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      phone: {
        type: DataTypes.STRING
      },
      password_hash: {
        type: DataTypes.STRING,
        allowNull: true
      },
      first_name: {
        type: DataTypes.STRING
      },
      last_name: {
        type: DataTypes.STRING
      },
      role: {
        type: DataTypes.ENUM('guest', 'staff', 'admin', 'superadmin'),
        defaultValue: 'guest'
      },
      property_id: {
        type: DataTypes.UUID,
        allowNull: true
      },
      email_verified_at: {
        type: DataTypes.DATE
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'users',
      timestamps: true,
      underscored: true
    }
  )

  return User
}
