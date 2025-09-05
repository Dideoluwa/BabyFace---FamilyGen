const express = require('express');
const router = express.Router();

// Import route modules
const imageGenerationRoutes = require('./imageGeneration');
const familyGenerationRoutes = require('./familyGeneration');

// Mount routes
router.use('/', imageGenerationRoutes);
router.use('/', familyGenerationRoutes);

// API info route
router.get('/info', (req, res) => {
  res.json({
    message: 'Young Parent API',
    version: '1.0.0',
    endpoints: {
      imageGeneration: '/api/generate-image',
      familyGeneration: '/api/generate-family',
      health: '/health'
    }
  });
});

module.exports = router;
