import { put, del } from '@vercel/blob';
import path from 'path';
import crypto from 'crypto';

/**
 * Check if Vercel Blob storage is configured via environment variables
 * @returns {boolean}
 */
export const isConfigured = () => {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
};

/**
 * Map common image MIME types to standard file extensions
 */
const MIME_EXTENSION_MAP = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/svg+xml': 'svg',
};

/**
 * Upload an image buffer to Vercel Blob storage
 * Falls back to base64 Data URI if BLOB_READ_WRITE_TOKEN is not configured (e.g. offline testing)
 *
 * @param {Buffer} buffer - File buffer from Multer
 * @param {string} mimeType - File mimetype (e.g. 'image/jpeg')
 * @param {string} folder - Storage folder prefix (e.g. 'social_posts')
 * @param {string} originalName - Original file name if provided
 * @returns {Promise<string>} - The public HTTPS URL of the uploaded image
 */
export const uploadImageBuffer = async (
  buffer,
  mimeType = 'image/jpeg',
  folder = 'social_posts',
  originalName = 'image'
) => {
  if (!isConfigured()) {
    console.warn('Vercel Blob token not configured. Using Data URI for local testing.');
    const base64 = buffer.toString('base64');
    return `data:${mimeType};base64,${base64}`;
  }

  try {
    const ext = MIME_EXTENSION_MAP[mimeType] || path.extname(originalName).replace('.', '') || 'jpg';
    const randomId = crypto.randomBytes(6).toString('hex');
    const filename = `${folder}/post-${Date.now()}-${randomId}.${ext}`;

    const blob = await put(filename, buffer, {
      access: 'public',
      contentType: mimeType,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    return blob.url;
  } catch (error) {
    console.error('Vercel Blob upload error:', error);
    throw error;
  }
};

/**
 * Delete an image from Vercel Blob storage by its URL
 * @param {string} url - The blob URL to delete
 * @returns {Promise<void>}
 */
export const deleteImage = async (url) => {
  if (!isConfigured() || !url || !url.startsWith('http')) {
    return;
  }

  try {
    await del(url, {
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
  } catch (error) {
    console.error('Vercel Blob delete error:', error);
  }
};

export default {
  isConfigured,
  uploadImageBuffer,
  deleteImage,
};
