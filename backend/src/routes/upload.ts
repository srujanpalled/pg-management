import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { authenticate } from '../middleware/auth';
import type { AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authenticate);

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Ensure the 'uploads' directory exists
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

router.post('/document', upload.single('file'), (req: Request, res: Response) => {
  try {
    if (!req.file) {
       return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // In a real application, you would save this path to a specific tenant's record
    // e.g., await prisma.tenant.update({ where: { id: req.body.tenantId }, data: { idProof: req.file.path } })
    
    res.status(200).json({
      message: 'File uploaded successfully',
      filePath: req.file.path
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
