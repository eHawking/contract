const express = require('express');
const { body } = require('express-validator');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { pool } = require('../database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { validate } = require('../middleware/validator');

const router = express.Router();

router.use(authenticateToken, requireAdmin);

async function getGeminiClient() {
  const conn = await pool.getConnection();
  try {
    const [settings] = await conn.query('SELECT gemini_api_key, gemini_model FROM app_settings WHERE id = 1');
    const apiKey = settings?.gemini_api_key || process.env.GEMINI_API_KEY;
    const modelName = settings?.gemini_model || process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    if (!apiKey) throw new Error('Gemini API key is not configured');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });
    return { model, modelName };
  } finally {
    conn.release();
  }
}

router.post('/generate/template', [
  body('description').isString().isLength({ min: 10 }),
  body('placeholders').optional().isArray(),
  body('tone').optional().isString(),
  body('language').optional().isString(),
  validate
], async (req, res) => {
  try {
    const { model } = await getGeminiClient();
    const { description, placeholders = [], tone = 'professional', language = 'English' } = req.body;

    const prompt = `You are an assistant that generates HTML contract templates for a construction company (AEMCO). 
Return strictly valid semantic HTML only, without markdown fences. 
Use <h1>, <h2>, <p>, <ul>, <li>, <table> where appropriate. 
Include placeholders wrapped in double curly braces like {{provider_name}}, {{amount}} if relevant.
Tone: ${tone}. Language: ${language}.
Context: ${description}.
If placeholders were provided, ensure you include them where appropriate: ${placeholders.join(', ')}.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    res.json({ content: text });
  } catch (err) {
    console.error('Gemini generate template error:', err);
    res.status(500).json({ error: err.message || 'Failed to generate template' });
  }
});

router.post('/generate/contract', [
  body('templateSummary').optional().isString(),
  body('variables').optional().isObject(),
  body('requirements').optional().isString(),
  validate
], async (req, res) => {
  try {
    const { model } = await getGeminiClient();
    const { templateSummary = '', variables = {}, requirements = '' } = req.body;

    const prompt = `Generate a complete HTML contract body for a construction company (AEMCO) using the following details.
Return strictly raw HTML only (no markdown), well-structured and ready to render in a rich text editor.
Template Summary: ${templateSummary}
Variables (JSON): ${JSON.stringify(variables)}
Additional Requirements: ${requirements}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    res.json({ content: text });
  } catch (err) {
    console.error('Gemini generate contract error:', err);
    res.status(500).json({ error: err.message || 'Failed to generate contract content' });
  }
});

module.exports = router;
