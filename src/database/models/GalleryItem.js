// models/GalleryItem.js
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class GalleryItem extends Model {
    static associate(models) {
      GalleryItem.belongsTo(models.Property, {
        foreignKey: 'property_id',
        as: 'property'
      });
    }
  }

  GalleryItem.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    property_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    category: {
      type: DataTypes.ENUM('rooms', 'dining', 'events', 'exterior'),
      allowNull: false
    },
    image_url: {
      type: DataTypes.STRING,
      allowNull: false
    },
    caption: {
      type: DataTypes.STRING
    },
    sort_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    sequelize,
    modelName: 'GalleryItem',
    tableName: 'gallery_items',
    timestamps: true,
    underscored: true
  });

  return GalleryItem;
};