const cloudinary = require('cloudinary').v2;

const isConfigured = () => {
  return (
    process.env.CLOUDINARY_URL ||
    (process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET)
  );
};

if (isConfigured()) {
  if (!process.env.CLOUDINARY_URL) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }
}

/**
 * Upload an image buffer to Cloudinary (or fallback to base64 Data URL if Cloudinary is not configured)
 * @param {Buffer} buffer - File buffer
 * @param {string} mimeType - File mimetype
 * @param {string} folder - Destination folder on Cloudinary
 * @returns {Promise<string>} - The resulting image URL
 */
const uploadImageBuffer = (buffer, mimeType = 'image/jpeg', folder = 'social_posts') => {
  return new Promise((resolve, reject) => {
    if (!isConfigured()) {
      console.warn('Cloudinary not fully configured. Using Data URI for local testing.');
      const base64 = buffer.toString('base64');
      const dataUri = `data:${mimeType};base64,${base64}`;
      return resolve(dataUri);
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          return reject(error);
        }
        resolve(result.secure_url);
      }
    );

    uploadStream.end(buffer);
  });
};

module.exports = {
  cloudinary,
  isConfigured,
  uploadImageBuffer,
};
