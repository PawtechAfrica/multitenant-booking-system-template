const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class RoomType extends Model {
    static associate(models) {
      RoomType.belongsTo(models.Property, {
        foreignKey: 'property_id',
        as: 'property'
      });
      RoomType.hasMany(models.RoomTypeImage, {
        foreignKey: 'room_type_id',
        as: 'images'
      });
      RoomType.hasMany(models.Room, {
        foreignKey: 'room_type_id',
        as: 'rooms'
      });
      RoomType.hasMany(models.RatePlan, {
        foreignKey: 'room_type_id',
        as: 'ratePlans'
      });
      RoomType.hasMany(models.Booking, {
        foreignKey: 'room_type_id',
        as: 'bookings'
      });
      RoomType.hasMany(models.BookingRoom, {
        foreignKey: 'room_type_id',
        as: 'bookingRooms'
      });
    }
  }

  RoomType.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    property_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    size_sqm: {
      type: DataTypes.DECIMAL(10, 2)
    },
    bed_type: {
      type: DataTypes.ENUM('single', 'twin', 'double', 'queen', 'king', 'bunk')
    },
    max_adults: {
      type: DataTypes.INTEGER
    },
    max_children: {
      type: DataTypes.INTEGER
    },
    total_units: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    base_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    currency: {
      type: DataTypes.STRING(3),
      defaultValue: 'KES'
    },
    attributes: {
      type: DataTypes.JSONB
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'RoomType',
    tableName: 'room_types',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['property_id', 'slug']
      }
    ]
  });

  return RoomType;
};