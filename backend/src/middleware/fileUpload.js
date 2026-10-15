const multer = require('multer');
const path = require('path');
const sharp = require('sharp');
const fs = require('fs');
const util = require('util');
const ErrorResponse = require('../utils/errorResponse');

// Promisify fs.unlink for async/await
const unlinkFile = util.promisify(fs.unlink);

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = process.env.UPLOAD_PATH || 'public/uploads';
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Create unique filename with original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  },
});

// File filter to only allow certain file types
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const filetypes = /jpeg|jpg|png|gif|webp/;
  // Check extension
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime type
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    return cb(
      new ErrorResponse(
        `Error: Only the following file types are allowed: ${filetypes}`,
        400
      ),
      false
    );
  }
};

// Initialize multer with configuration
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
  },
  fileFilter: fileFilter,
});

// Middleware to process and resize images
const processImage = (fieldName, options = {}) => {
  return async (req, res, next) => {
    try {
      if (!req.file) {
        return next();
      }

      const filePath = req.file.path;
      const fileName = req.file.filename;
      const outputPath = path.join(
        path.dirname(filePath),
        'resized-' + fileName
      );

      // Default options
      const defaultOptions = {
        width: 1200,
        height: 800,
        quality: 80,
        format: 'jpeg',
        fit: 'inside',
      };

      // Merge with provided options
      const { width, height, quality, format, fit } = {
        ...defaultOptions,
        ...options,
      };

      // Process the image
      await sharp(filePath)
        .resize(width, height, {
          fit: fit,
          withoutEnlargement: true,
        })
        .toFormat(format, {
          quality: quality,
          progressive: true,
        })
        .toFile(outputPath);

      // Remove original file
      await unlinkFile(filePath);

      // Update file info
      req.file.filename = 'resized-' + fileName;
      req.file.path = outputPath;
      req.file.mimetype = `image/${format}`;

      next();
    } catch (err) {
      // Clean up file if there was an error
      if (req.file) {
        await unlinkFile(req.file.path).catch(console.error);
      }
      next(err);
    }
  };
};

// Middleware to handle single file upload
const uploadFile = (fieldName) => {
  return (req, res, next) => {
    const uploadSingle = upload.single(fieldName);
    uploadSingle(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        // A Multer error occurred when uploading
        return next(new ErrorResponse(`File upload error: ${err.message}`, 400));
      } else if (err) {
        // An unknown error occurred
        return next(err);
      }
      next();
    });
  };
};

// Middleware to handle multiple file uploads
const uploadFiles = (fieldName, maxCount = 5) => {
  return (req, res, next) => {
    const uploadMultiple = upload.array(fieldName, maxCount);
    uploadMultiple(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        // A Multer error occurred when uploading
        return next(new ErrorResponse(`File upload error: ${err.message}`, 400));
      } else if (err) {
        // An unknown error occurred
        return next(err);
      }
      next();
    });
  };
};

// Middleware to clean up files if there's an error in the request
const cleanupFiles = (req, res, next) => {
  // This will run after the response is sent
  res.on('finish', async () => {
    if (res.statusCode >= 400) {
      // If there was an error, clean up any uploaded files
      if (req.file) {
        await unlinkFile(req.file.path).catch(console.error);
      } else if (req.files && req.files.length > 0) {
        await Promise.all(
          req.files.map((file) => unlinkFile(file.path).catch(console.error))
        );
      }
    }
  });
  next();
};

module.exports = {
  upload,
  uploadFile,
  uploadFiles,
  processImage,
  cleanupFiles,
};
