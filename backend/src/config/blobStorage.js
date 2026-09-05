import { put, del } from '@vercel/blob';
import path from 'path';
import crypto from 'crypto';

// Check if Vercel blob storage token is configured
export const isConfigured = () => {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
};

// Common file extensions for image mime types
const MIME_EXTENSION_MAP = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/svg+xml': 'svg',
};

// Upload an image to Vercel Blob (or fallback to base64 for local dev)
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

// Delete an image from Vercel Blob storage
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
