// models/AuditLog.js
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class AuditLog extends Model {
    static associate(models) {
      AuditLog.belongsTo(models.User, {
        foreignKey: 'actor_user_id',
        as: 'actor'
      });
    }
  }

  AuditLog.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    actor_user_id: {
      type: DataTypes.UUID,
      allowNull: true
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false
    },
    entity_type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    entity_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    changes: {
      type: DataTypes.JSONB
    }
  }, {
    sequelize,
    modelName: 'AuditLog',
    tableName: 'audit_log',
    timestamps: true,
    underscored: true
  });

  return AuditLog;
};