module.exports = async (req, res) => {
  try {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      service: 'WhisperCart API',
      version: '1.0.0'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
