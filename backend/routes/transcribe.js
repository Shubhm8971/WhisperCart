const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const { createClient } = require('@deepgram/sdk');
const llmService = require('../utils/llmService');
const config = require('../config');
const History = require('../models/History'); // Import History model
const Notification = require('../models/Notification'); // Import Notification model
const authenticate = require('../middleware/auth'); // Import auth middleware

const upload = multer({ dest: 'uploads/' });
const deepgram = createClient(config.deepgramApiKey);

/**
 * SIMULATED DEAL HUNTER (Proactive Background Discovery)
 */
// Note: Removed `db` parameter, as Mongoose models are globally accessible once defined.
function triggerDealHunter(product, budget) {
  if (!product) return;

  console.log(`[v7.0] Deal Hunter triggered for: ${product}`);

  // Simulate "hunting" time (3-8 seconds)
  const delay = 3000 + Math.random() * 5000;

  setTimeout(async () => {
    try {
      const discountedPrice = budget ? Math.floor(budget * 0.9) : 2500;
      const notification = {
        // Mongoose will handle _id generation
        type: 'price_drop',
        title: 'Deal Found! 🔥',
        message: `We found a ${product} for ₹${discountedPrice} (under your ₹${budget || 'requested'} budget)!`,
        time: 'Just now', // Consider using actual date format in model
        isRead: false,
        createdAt: new Date(),
        productName: product
      };

      await Notification.create(notification); // Use Mongoose model
      console.log(`[v7.0] Proactive Notification Saved: ${product}`);
    } catch (e) {
      console.error('Deal Hunter failure:', e);
    }
  }, delay);
}

router.post('/', upload.single('file'), async (req, res) => {
  // Removed `db` from req.app.locals destructuring as Mongoose models are used directly
  const isPrivacyMode = req.body.privacyMode === true;
  const timestamp = req.body.timestamp || Date.now();

  // DIRECT TEXT INPUT SUPPORT
  if (req.body.text) {
    console.log('Processing direct text input:', req.body.text);
    try {
      const rawText = req.body.text;
      const intentData = await llmService.extractIntentWithLLM(rawText);

      if (intentData && intentData.product) {
        await History.create({ // Use Mongoose model
          ...intentData,
          raw_text: rawText,
          createdAt: new Date(),
          isPrivacyMode,
          processingTimestamp: timestamp,
        });

        // TRIGGER PROACTIVE DEAL HUNTER
        triggerDealHunter(intentData.product, intentData.budget); // Call without `db`
      }

      return res.json({
        action: intentData ? intentData.action : 'search',
        product: intentData ? intentData.product : null,
        budget: intentData ? intentData.budget : null,
        features: intentData ? intentData.features : [],
        raw_text: rawText,
        isPrivacyMode,
      });
    } catch (error) {
      console.error('Error processing text input:', error);
      return res.status(500).json({ error: 'Failed to process text.' });
    }
  }

  // AUDIO PROCESSING (Deepgram Integration with Privacy Enhancements)
  let audioBuffer;
  let tempPath = null;

  try {
    if (req.body.audio) {
      console.log(`Processing ${isPrivacyMode ? 'privacy-mode ' : ''}base64 audio with Deepgram...`);
      audioBuffer = Buffer.from(req.body.audio, 'base64');
    } else if (req.file) {
      console.log(`Processing ${isPrivacyMode ? 'privacy-mode ' : ''}multipart file with Deepgram:`, req.file.path);
      tempPath = req.file.path;
      audioBuffer = fs.readFileSync(tempPath);
    } else {
      return res.status(400).json({ error: 'No audio or text provided.' });
    }

    const { result, error } = await deepgram.listen.prerecorded.transcribeFile(audioBuffer, {
      model: "nova-2",
      smart_format: true,
      mimetype: "audio/m4a"
    });

    if (error) throw error;

    if (tempPath) fs.unlinkSync(tempPath);

    const rawText = result.results.channels[0].alternatives[0].transcript;
    console.log(`${isPrivacyMode ? '[Privacy Mode] ' : ''}Deepgram Result:`, rawText);

    if (!rawText) {
      return res.json({ 
        product: null, 
        budget: null, 
        features: [], 
        raw_text: '',
        isPrivacyMode 
      });
    }

    const intentData = await llmService.extractIntentWithLLM(rawText);

    // In privacy mode, only store if shopping intent is detected
    if (intentData && intentData.product) {
      await History.create({ // Use Mongoose model
        ...intentData,
        raw_text: rawText,
        createdAt: new Date(),
        isPrivacyMode,
        processingTimestamp: timestamp,
      });

      // TRIGGER PROACTIVE DEAL HUNTER
      triggerDealHunter(intentData.product, intentData.budget); // Call without `db`
    } else if (isPrivacyMode) {
      // In privacy mode, don't store non-shopping intent conversations
      console.log('[Privacy Mode] Non-shopping intent detected, not storing');
    }

    res.json({
      action: intentData ? intentData.action : 'search',
      product: intentData ? intentData.product : null,
      budget: intentData ? intentData.budget : null,
      features: intentData ? intentData.features : [],
      raw_text: rawText,
      isPrivacyMode,
    });

  } catch (err) {
    if (tempPath && fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    console.error(`${isPrivacyMode ? '[Privacy Mode] ' : ''}Deepgram Error:`, err.message || err);
    res.status(500).json({ error: 'Transcription failed.', details: err.message });
  }
});

module.exports = router;
