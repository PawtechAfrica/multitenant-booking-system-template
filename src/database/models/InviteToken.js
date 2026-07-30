const { Model, DataTypes } = require('sequelize')

module.exports = sequelize => {
  class InviteToken extends Model {
    static associate (models) {
      InviteToken.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' })
    }
  }

  InviteToken.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      user_id: { type: DataTypes.UUID, allowNull: false },
      token_hash: { type: DataTypes.STRING, allowNull: false, unique: true },
      expires_at: { type: DataTypes.DATE, allowNull: false },
      used_at: { type: DataTypes.DATE, allowNull: true }
    },
    {
      sequelize,
      modelName: 'InviteToken',
      tableName: 'invite_tokens',
      timestamps: true,
      underscored: true
    }
  )

  return InviteToken
}
