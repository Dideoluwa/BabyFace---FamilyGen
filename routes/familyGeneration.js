const express = require('express');
const FamilyGenerationController = require('../controllers/familyGenerationController');
const router = express.Router();

const familyController = new FamilyGenerationController();


router.post('/generate-family', 
  (req, res, next) => {
    familyController.getUploadMiddleware()(req, res, (err) => {
      if (err) {
        console.error('Multer error:', err);
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return res.status(400).json({
            success: false,
            error: 'Unexpected field',
            message: 'Please upload exactly 2 images for the parents'
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
    await familyController.generateFamilyPicture(req, res);
  }
);


router.get('/family/download/:filename', 
  async (req, res) => {
    await familyController.downloadFamilyImage(req, res);
  }
);


router.get('/family/info/:filename', 
  async (req, res) => {
    await familyController.getFamilyImageInfo(req, res);
  }
);


router.get('/generate-family/status', (req, res) => {
  res.json({
    success: true,
    message: 'Family generation service is running',
    service: 'Gemini 2.5 Flash Image Preview - Family Generation',
    endpoints: {
      generate: 'POST /api/generate-family',
      download: 'GET /api/family/download/:filename',
      info: 'GET /api/family/info/:filename'
    },
    supportedFormats: ['JPEG', 'PNG', 'WebP'],
    maxFileSize: 'No limit',
    requiredImages: 2,
    familyOptions: {
      numberOfChildren: 'Number of children to generate (1-6, default: 2)',
      ageGap: 'Age gap between children in years (1-5, default: 2)',
      youngestAge: 'Age of youngest child (1-12, default: 4)',
      quality: 'JPEG quality 1-100 (default: 95)',
      format: 'Output format: jpeg, png, webp (default: jpeg)',
      enhanceQuality: 'Enable quality enhancement (default: true)'
    },
    usage: {
      queryParams: 'Add family options as query parameters: ?numberOfChildren=3&ageGap=3&youngestAge=5',
      formData: 'Add family options in form data alongside the parent images',
      uploadFields: 'Use field names "parent1" and "parent2" or upload any 2 images'
    },
    examples: {
      curl: 'curl -X POST "http://localhost:3000/api/generate-family?numberOfChildren=3&ageGap=2" -F "parent1=@person1.jpg" -F "parent2=@person2.jpg"',
      javascript: 'const formData = new FormData(); formData.append("parent1", file1); formData.append("parent2", file2); formData.append("numberOfChildren", "3");'
    }
  });
});

module.exports = router;
