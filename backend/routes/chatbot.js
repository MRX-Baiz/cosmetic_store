const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
const { retrieveRelevantProductInfo } = require('../utils/rag');

dotenv.config(); // Load environment variables

const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// For text-only input, use the gemini-2.0-flash model
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash"});

router.post('/ask', async (req, res) => {
  const { query } = req.body;
  if (!query) {
    return res.status(400).json({ message: 'Query is required' });
  }

  try {
    const relevantContext = await retrieveRelevantProductInfo(query);
    let prompt = query;
    if (relevantContext) {
      prompt = `Based on the following store data: ${relevantContext}\n\nAnswer the user's question: ${query}`;
    }
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    res.json({ response: text });
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    res.status(500).json({ message: 'Error generating response from AI.', detail: error.message });
  }
});

module.exports = router;
