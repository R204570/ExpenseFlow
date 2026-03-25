import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import { authenticate } from '../middleware/auth.js';
import supabase, { hasSupabaseStorage, supabaseStorageBucket } from '../lib/supabase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();
const uploadsDir = path.join(__dirname, '../../uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 4 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
      return;
    }

    cb(new Error('Invalid file type. Only JPEG, PNG, WebP, and HEIC are allowed.'));
  }
});

router.post('/receipt', authenticate, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const ext = path.extname(req.file.originalname) || '.jpg';
    const filename = `${uuidv4()}${ext}`;

    if (hasSupabaseStorage) {
      const objectPath = `receipts/${req.user.id}/${filename}`;
      const { error: uploadError } = await supabase.storage
        .from(supabaseStorageBucket)
        .upload(objectPath, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: false
        });

      if (uploadError) {
        console.error('Supabase upload error:', uploadError);
        return res.status(500).json({ error: 'Failed to store receipt image' });
      }

      const { data } = supabase.storage.from(supabaseStorageBucket).getPublicUrl(objectPath);

      return res.json({
        url: data.publicUrl,
        filename: objectPath
      });
    }

    if (process.env.VERCEL) {
      return res.status(500).json({
        error: 'Receipt storage is not configured. Add SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and SUPABASE_STORAGE_BUCKET in Vercel.'
      });
    }

    const localPath = path.join(uploadsDir, filename);
    fs.writeFileSync(localPath, req.file.buffer);

    res.json({
      url: `/api/upload/files/${filename}`,
      filename
    });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: 'Failed to upload image' });
  }
});

router.get('/files/:filename', (req, res) => {
  const filePath = path.join(uploadsDir, req.params.filename);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});

router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'Receipt image must be 4MB or smaller.' });
  }

  if (err) {
    return res.status(400).json({ error: err.message || 'Invalid upload request' });
  }

  return next();
});

export default router;
