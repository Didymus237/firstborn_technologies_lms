import express from 'express';
import multer from 'multer';
import path from 'path';
import { protect } from '../middleware/auth';
import fs from 'fs';

const router = express.Router();

const uploadDir = path.join(__dirname, '../../uploads/profiles');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDir);
  },
  filename(req: any, file, cb) {
    const userId = req.user ? req.user._id : 'unknown';
    cb(null, `${userId}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const checkFileType = (file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const filetypes = /jpg|jpeg|png/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Images only (JPG, JPEG, PNG)!'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

router.post('/profile-picture', protect, (req: any, res: any, next) => {
  upload.single('image')(req, res, (err: any) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ message: err.message });
      }
      return res.status(400).json({ message: err.message });
    }
    
    if (req.file) {
      const filePath = `/uploads/profiles/${req.file.filename}`;
      res.status(200).json({ message: 'Image uploaded successfully', url: filePath });
    } else {
      res.status(400).json({ message: 'No image file provided' });
    }
  });
});

export default router;
