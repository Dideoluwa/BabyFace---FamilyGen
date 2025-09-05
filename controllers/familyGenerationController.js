const FamilyGenerationService = require("../services/familyGenerationService");
const multer = require("multer");
const path = require("path");

class FamilyGenerationController {
  constructor() {
    this.familyService = new FamilyGenerationService();
    this.setupMulter();
  }

  setupMulter() {
    const storage = multer.memoryStorage();

    this.upload = multer({
      storage: storage,
      limits: {
        files: 2,
      },
      fileFilter: (req, file, cb) => {
        const allowedTypes = [
          "image/jpeg",
          "image/jpg",
          "image/png",
          "image/webp",
        ];
        if (allowedTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(
            new Error(
              "Invalid file type. Only JPEG, PNG, and WebP images are allowed."
            ),
            false
          );
        }
      },
    });

    this.uploadParents = this.upload.fields([
      { name: 'parent1', maxCount: 1 },
      { name: 'parent2', maxCount: 1 }
    ]);
    this.uploadAny = this.upload.any();
  }

  async generateFamilyPicture(req, res) {
    try {
      let parent1File, parent2File;
      
      if (req.files && req.files.parent1 && req.files.parent2) {
        parent1File = req.files.parent1[0];
        parent2File = req.files.parent2[0];
      } else if (req.files && req.files.length >= 2) {
        parent1File = req.files[0];
        parent2File = req.files[1];
      } else {
        return res.status(400).json({
          success: false,
          error: "Insufficient images provided",
          message: "Please upload exactly 2 images (one for each parent). Use field names 'parent1' and 'parent2' or upload any 2 images."
        });
      }

      const validationError1 = this.validateImageFile(parent1File);
      if (validationError1) {
        return res.status(400).json({
          success: false,
          error: "Invalid image file",
          message: `Parent 1 (${parent1File.originalname}): ${validationError1}`
        });
      }

      const validationError2 = this.validateImageFile(parent2File);
      if (validationError2) {
        return res.status(400).json({
          success: false,
          error: "Invalid image file",
          message: `Parent 2 (${parent2File.originalname}): ${validationError2}`
        });
      }

      console.log(`Processing parent images: ${parent1File.originalname} and ${parent2File.originalname}`);

      const familyOptions = {
        numberOfChildren: parseInt(req.body.numberOfChildren) || parseInt(req.query.numberOfChildren) || 2,
        ageGap: parseInt(req.body.ageGap) || parseInt(req.query.ageGap) || 2,
        youngestAge: parseInt(req.body.youngestAge) || parseInt(req.query.youngestAge) || 4,
        quality: parseInt(req.body.quality) || parseInt(req.query.quality) || 95,
        format: req.body.format || req.query.format || 'jpeg',
        enhanceQuality: req.body.enhanceQuality !== 'false' && req.query.enhanceQuality !== 'false'
      };

      const validationError = this.validateFamilyOptions(familyOptions);
      if (validationError) {
        return res.status(400).json({
          success: false,
          error: "Invalid family options",
          message: validationError
        });
      }

      console.log('Family options:', familyOptions);

      const result = await this.familyService.generateFamilyPicture(
        parent1File.buffer,
        parent2File.buffer,
        parent1File.originalname,
        parent2File.originalname,
        familyOptions
      );

      res.json({
        success: true,
        message: "Family picture generated successfully",
        data: {
          parent1Filename: result.parent1Filename,
          parent2Filename: result.parent2Filename,
          generatedFilename: result.generatedFilename,
          downloadUrl: `/api/family/download/${result.generatedFilename}`,
          familySpecs: result.familySpecs,
          metadata: result.metadata,
          qualitySettings: familyOptions,
        },
      });
    } catch (error) {
      console.error("Family generation controller error:", error);

      res.status(500).json({
        success: false,
        error: "Family generation failed",
        message: error.message || "An unexpected error occurred",
      });
    }
  }

  async downloadFamilyImage(req, res) {
    try {
      const filename = req.params.filename;
      const filePath = path.join(
        process.env.UPLOAD_PATH || "./uploads",
        filename
      );

      const fs = require("fs");
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          success: false,
          error: "File not found",
          message: "The requested family image file does not exist",
        });
      }

      res.setHeader("Content-Type", "image/jpeg");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`
      );

      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } catch (error) {
      console.error("Family download error:", error);
      res.status(500).json({
        success: false,
        error: "Download failed",
        message: "An error occurred while downloading the family image",
      });
    }
  }

  async getFamilyImageInfo(req, res) {
    try {
      const filename = req.params.filename;
      const filePath = path.join(
        process.env.UPLOAD_PATH || "./uploads",
        filename
      );

      const fs = require("fs");
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          success: false,
          error: "File not found",
          message: "The requested family image file does not exist",
        });
      }

      const stats = fs.statSync(filePath);

      res.json({
        success: true,
        data: {
          filename: filename,
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime,
          downloadUrl: `/api/family/download/${filename}`,
        },
      });
    } catch (error) {
      console.error("Family image info error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to get family image info",
        message: "An error occurred while retrieving family image information",
      });
    }
  }

  validateImageFile(file) {
    if (!file.buffer || file.buffer.length === 0) {
      return "Uploaded file is empty";
    }

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.mimetype)) {
      return "Invalid file type. Only JPEG, PNG, and WebP images are allowed";
    }

    return null;
  }

  validateFamilyOptions(options) {
    const { numberOfChildren, ageGap, youngestAge } = options;

    if (numberOfChildren < 1 || numberOfChildren > 6) {
      return "Number of children must be between 1 and 6";
    }

    if (ageGap < 1 || ageGap > 5) {
      return "Age gap must be between 1 and 5 years";
    }

    if (youngestAge < 1 || youngestAge > 12) {
      return "Youngest age must be between 1 and 12 years";
    }

    const oldestAge = youngestAge + ((numberOfChildren - 1) * ageGap);
    if (oldestAge > 18) {
      return "With these settings, the oldest child would be over 18 years old. Please adjust the parameters.";
    }

    return null;
  }

  getUploadMiddleware() {
    return this.uploadAny;
  }

  getUploadMiddlewareForParents() {
    return this.uploadParents;
  }
}

module.exports = FamilyGenerationController;
