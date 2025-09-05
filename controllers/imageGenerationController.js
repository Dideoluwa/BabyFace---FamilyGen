const ImageGenerationService = require("../services/imageGenerationService");
const multer = require("multer");
const path = require("path");

class ImageGenerationController {
  constructor() {
    this.imageService = new ImageGenerationService();
    this.setupMulter();
  }

  setupMulter() {
    const storage = multer.memoryStorage();

    this.upload = multer({
      storage: storage,
      limits: {
        files: 1,
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

    this.uploadImage = this.upload.single("image");
    this.uploadFile = this.upload.single("file");
    this.uploadAny = this.upload.any();
  }

  async generateBabyFaceImage(req, res) {
    try {
      const file = req.file || (req.files && req.files[0]);

      if (!file) {
        return res.status(400).json({
          success: false,
          error: "No image file provided",
          message:
            'Please upload an image file. Use field name "image" or "file"',
        });
      }

      const validationError = this.validateImageFile(file);
      if (validationError) {
        return res.status(400).json({
          success: false,
          error: "Invalid image file",
          message: validationError,
        });
      }

      console.log(
        `Processing image: ${file.originalname} (${file.size} bytes)`
      );

      // Extract quality options from request body or query params
      const qualityOptions = {
        maxWidth: parseInt(req.body.maxWidth) || parseInt(req.query.maxWidth) || 2048,
        maxHeight: parseInt(req.body.maxHeight) || parseInt(req.query.maxHeight) || 2048,
        quality: parseInt(req.body.quality) || parseInt(req.query.quality) || 95,
        format: req.body.format || req.query.format || 'jpeg',
        enhanceQuality: req.body.enhanceQuality !== 'false' && req.query.enhanceQuality !== 'false'
      };

      console.log('Quality options:', qualityOptions);

      const result = await this.imageService.generateBabyFaceImage(
        file.buffer,
        file.originalname,
        qualityOptions
      );

      res.json({
        success: true,
        message: "Image transformed successfully",
        data: {
          originalFilename: result.originalFilename,
          generatedFilename: result.generatedFilename,
          downloadUrl: `/api/images/download/${result.generatedFilename}`,
          metadata: result.metadata,
          qualitySettings: qualityOptions,
        },
      });
    } catch (error) {
      console.error("Controller error:", error);

      res.status(500).json({
        success: false,
        error: "Image generation failed",
        message: error.message || "An unexpected error occurred",
      });
    }
  }

  async downloadImage(req, res) {
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
          message: "The requested image file does not exist",
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
      console.error("Download error:", error);
      res.status(500).json({
        success: false,
        error: "Download failed",
        message: "An error occurred while downloading the file",
      });
    }
  }

  async getImageInfo(req, res) {
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
          message: "The requested image file does not exist",
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
          downloadUrl: `/api/images/download/${filename}`,
        },
      });
    } catch (error) {
      console.error("Image info error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to get image info",
        message: "An error occurred while retrieving image information",
      });
    }
  }

  validateImageFile(file) {
    // Check if file has content
    if (!file.buffer || file.buffer.length === 0) {
      return "Uploaded file is empty";
    }

    // Check file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.mimetype)) {
      return "Invalid file type. Only JPEG, PNG, and WebP images are allowed";
    }

    return null;
  }

  getUploadMiddleware() {
    return this.uploadAny;
  }

  getUploadMiddlewareForField(fieldName) {
    return this.upload.single(fieldName);
  }
}

module.exports = ImageGenerationController;
