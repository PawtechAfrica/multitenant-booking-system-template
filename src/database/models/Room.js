// models/Room.js
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Room extends Model {
    static associate(models) {
      Room.belongsTo(models.Property, {
        foreignKey: 'property_id',
        as: 'property'
      });
      Room.belongsTo(models.RoomType, {
        foreignKey: 'room_type_id',
        as: 'roomType'
      });
      Room.hasMany(models.BookingRoom, {
        foreignKey: 'room_id',
        as: 'bookingRooms'
      });
    }
  }

  Room.init({
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
    room_number: {
      type: DataTypes.STRING
    },
    floor: {
      type: DataTypes.STRING
    },
    status: {
      type: DataTypes.ENUM('active', 'maintenance', 'out_of_service'),
      defaultValue: 'active'
    }
  }, {
    sequelize,
    modelName: 'Room',
    tableName: 'rooms',
    timestamps: true,
    underscored: true
  });

  return Room;
};