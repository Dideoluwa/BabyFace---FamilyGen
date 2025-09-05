const express = require('express');
const ImageGenerationController = require('../controllers/imageGenerationController');
const router = express.Router();

const imageController = new ImageGenerationController();


router.post('/generate-image', 
  (req, res, next) => {
    imageController.getUploadMiddleware()(req, res, (err) => {
      if (err) {
        console.error('Multer error:', err);
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return res.status(400).json({
            success: false,
            error: 'Unexpected field',
            message: 'Please use field name "image" or "file" for the upload'
          });
        }
        return res.status(400).json({
          success: false,
          error: 'Upload error',
          message: err.message || 'File upload failed'
        });
      }
      next();
    });
  },
  async (req, res) => {
    await imageController.generateBabyFaceImage(req, res);
  }
);


router.get('/images/download/:filename', 
  async (req, res) => {
    await imageController.downloadImage(req, res);
  }
);


router.get('/images/info/:filename', 
  async (req, res) => {
    await imageController.getImageInfo(req, res);
  }
);


router.get('/generate-image/status', (req, res) => {
  res.json({
    success: true,
    message: 'Image generation service is running',
    service: 'Gemini 2.5 Flash Image Preview',
    endpoints: {
      generate: 'POST /api/generate-image',
      download: 'GET /api/images/download/:filename',
      info: 'GET /api/images/info/:filename'
    },
    supportedFormats: ['JPEG', 'PNG', 'WebP'],
    maxFileSize: 'No limit',
    qualityOptions: {
      maxWidth: 'Maximum width in pixels (default: 2048)',
      maxHeight: 'Maximum height in pixels (default: 2048)', 
      quality: 'JPEG quality 1-100 (default: 95)',
      format: 'Output format: jpeg, png, webp (default: jpeg)',
      enhanceQuality: 'Enable quality enhancement (default: true)'
    },
    usage: {
      queryParams: 'Add quality options as query parameters: ?quality=98&maxWidth=4096',
      formData: 'Add quality options in form data alongside the image file'
    }
  });
});

module.exports = router;
