// models/MediaAsset.js
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class MediaAsset extends Model {
    static associate(models) {
      MediaAsset.belongsTo(models.Property, {
        foreignKey: 'property_id',
        as: 'property'
      });
      MediaAsset.belongsTo(models.User, {
        foreignKey: 'uploaded_by',
        as: 'uploadedBy'
      });
    }
  }

  MediaAsset.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    property_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false
    },
    original_filename: {
      type: DataTypes.STRING,
      allowNull: false
    },
    mime_type: {
      type: DataTypes.STRING
    },
    size_bytes: {
      type: DataTypes.INTEGER
    },
    uploaded_by: {
      type: DataTypes.UUID,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'MediaAsset',
    tableName: 'media_assets',
    timestamps: true,
    underscored: true
  });

  return MediaAsset;
};