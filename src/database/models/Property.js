// models/Property.js
const { Model, DataTypes } = require('sequelize')

module.exports = sequelize => {
  class Property extends Model {
    static associate (models) {
      Property.hasMany(models.RoomType, {
        foreignKey: 'property_id',
        as: 'roomTypes'
      })
      Property.hasMany(models.Room, {
        foreignKey: 'property_id',
        as: 'rooms'
      })
      Property.hasMany(models.RatePlan, {
        foreignKey: 'property_id',
        as: 'ratePlans'
      })
      Property.hasMany(models.CancellationPolicy, {
        foreignKey: 'property_id',
        as: 'cancellationPolicies'
      })
      Property.hasMany(models.Booking, {
        foreignKey: 'property_id',
        as: 'bookings'
      })
      Property.hasMany(models.Offer, {
        foreignKey: 'property_id',
        as: 'offers'
      })
      Property.hasMany(models.GalleryItem, {
        foreignKey: 'property_id',
        as: 'galleryItems'
      })
      Property.hasMany(models.Inquiry, {
        foreignKey: 'property_id',
        as: 'inquiries'
      })
      Property.hasMany(models.EventType, {
        foreignKey: 'property_id',
        as: 'eventTypes'
      })
      Property.hasMany(models.MediaAsset, {
        foreignKey: 'property_id',
        as: 'mediaAssets'
      })
      Property.hasMany(models.User, {
        foreignKey: 'property_id',
        as: 'staffUsers'
      })
    }
  }

  Property.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      slug: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      timezone: {
        type: DataTypes.STRING,
        defaultValue: 'Africa/Nairobi'
      },
      currency: {
        type: DataTypes.STRING(3),
        defaultValue: 'KES'
      },
      contact_email: {
        type: DataTypes.STRING
      },
      contact_phone: {
        type: DataTypes.STRING
      },
      address: {
        type: DataTypes.TEXT
      },
      check_in_time: {
        type: DataTypes.TIME,
        defaultValue: '14:00'
      },
      check_out_time: {
        type: DataTypes.TIME,
        defaultValue: '10:00'
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      }
    },
    {
      sequelize,
      modelName: 'Property',
      tableName: 'properties',
      timestamps: true,
      underscored: true
    }
  )

  return Property
}
