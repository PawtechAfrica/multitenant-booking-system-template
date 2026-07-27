const streamifier = require('streamifier')
const cloudinary = require('../config/cloudinary')
const { MediaAsset } = require('../database/models')
const AppError = require('../utils/AppError')

const uploadBufferToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (error, result) => {
        if (error) return reject(error)
        resolve(result)
      }
    )
    streamifier.createReadStream(buffer).pipe(stream)
  })
}

const uploadMedia = async (propertyId, file, uploadedByUserId) => {
  if (!file) {
    throw new AppError('No file was provided.', 400, 'VALIDATION_ERROR')
  }

  let cloudinaryResult
  try {
    cloudinaryResult = await uploadBufferToCloudinary(file.buffer, `properties/${propertyId}`)
  } catch (err) {
    throw new AppError('Image upload failed. Please try again.', 502, 'VALIDATION_ERROR')
  }

  const asset = await MediaAsset.create({
    property_id: propertyId,
    url: cloudinaryResult.secure_url,
    original_filename: file.originalname,
    mime_type: file.mimetype,
    size_bytes: file.size,
    uploaded_by: uploadedByUserId
  })

  return { id: asset.id, url: asset.url }
}

module.exports = { uploadMedia }