const express = require('express');
const router = express.Router();

const imageGenerationRoutes = require('./imageGeneration');
const familyGenerationRoutes = require('./familyGeneration');

router.use('/', imageGenerationRoutes);
router.use('/', familyGenerationRoutes);

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
