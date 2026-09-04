import multer from 'multer';

// Store file in memory to avoid writing to ephemeral disk
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (jpeg, png, webp, gif) are allowed!'), false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB max file size
  },
  fileFilter,
});

export default upload;
