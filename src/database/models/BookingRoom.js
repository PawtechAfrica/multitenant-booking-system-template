// models/BookingRoom.js
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class BookingRoom extends Model {
    static associate(models) {
      BookingRoom.belongsTo(models.Booking, {
        foreignKey: 'booking_id',
        as: 'booking'
      });
      BookingRoom.belongsTo(models.Room, {
        foreignKey: 'room_id',
        as: 'room'
      });
      BookingRoom.belongsTo(models.RoomType, {
        foreignKey: 'room_type_id',
        as: 'roomType'
      });
    }
  }

  BookingRoom.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    booking_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    room_id: {
      type: DataTypes.UUID,
      allowNull: true
    },
    room_type_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    sequence: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    sequelize,
    modelName: 'BookingRoom',
    tableName: 'booking_rooms',
    timestamps: true,
    underscored: true
  });

  return BookingRoom;
};