const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const { AssemblyAI } = require('assemblyai');
const llmService = require('../utils/llmService');
const config = require('../config');

const upload = multer({ dest: 'uploads/' });
const assemblyaiClient = new AssemblyAI({ apiKey: config.assemblyAIApiKey });

router.post('/', upload.single('file'), async (req, res) => {
  const { db } = req.app.locals;

  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  try {
    const transcript = await assemblyaiClient.transcripts.create({
      audio: fs.createReadStream(req.file.path),
    });
    const rawText = transcript.text;

    // Clean up the uploaded file after transcription
    fs.unlink(req.file.path, (err) => {
      if (err) console.error('Error deleting uploaded file:', err);
    });

    if (!rawText) {
      return res.json({ product: null, budget: null, features: [], raw_text: '' });
    }

    const intentData = await llmService.extractIntentWithLLM(rawText);

    // Save to history if a product was detected
    if (intentData && intentData.product) {
      const historyEntry = {
        ...intentData,
        raw_text: rawText,
        createdAt: new Date(),
      };
      await db.collection('history').insertOne(historyEntry);
    }

    const response = {
      product: intentData ? intentData.product : null,
      budget: intentData ? intentData.budget : null,
      features: intentData ? intentData.features : [],
      raw_text: rawText,
    };

    console.log('Received audio file, sending response:', response);
    res.json(response);
  } catch (error) {
    console.error('Error during audio processing or intent detection:', error);
    res.status(500).json({ error: 'Failed to process audio.', details: error.message });
  }
});

module.exports = router;
