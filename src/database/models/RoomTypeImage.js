// models/RoomTypeImage.js
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class RoomTypeImage extends Model {
    static associate(models) {
      RoomTypeImage.belongsTo(models.RoomType, {
        foreignKey: 'room_type_id',
        as: 'roomType'
      });
    }
  }

  RoomTypeImage.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    room_type_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false
    },
    alt_text: {
      type: DataTypes.STRING
    },
    sort_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    is_cover: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'RoomTypeImage',
    tableName: 'room_type_images',
    timestamps: true,
    underscored: true
  });

  return RoomTypeImage;
};