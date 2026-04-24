const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const router = express.Router();

const SYSTEM_PROMPT = `You are the CrisisConnect AI Assistant, an expert emergency response and disaster management AI. 
Your primary job is to provide accurate, calm, and helpful information during crises.
Be concise, practical, and empathetic. Format your responses with Markdown for readability (use bold text and emojis where appropriate).
If asked about shelters, reporting a crisis, volunteering, or evacuation routes, you should provide helpful general guidance and suggest using the features available on this platform (CrisisConnect).
If you don't know the answer or the situation sounds like a medical/life-threatening emergency, ALWAYS advise the user to call 112 (National Emergency) or 108 (Ambulance).
Keep responses under 150 words when possible for quick reading.`;

router.post('/', async (req, res) => {
  try {
    const { message, history } = req.body;
    
    // Check if API key exists
    if (!process.env.GEMINI_API_KEY) {
      return res.json({ 
        response: "⚠️ **API Key Missing**\n\nI am running in offline mode because `GEMINI_API_KEY` is not set in the server's `.env` file.\n\nTo enable my full AI capabilities, please add a valid Google Gemini API key to the backend `.env` file and restart the server!"
      });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", systemInstruction: SYSTEM_PROMPT });

    // Format history for Gemini ensuring it starts with user and alternates
    const formattedHistory = [];
    for (const msg of (history || [])) {
      const role = msg.type === 'bot' ? 'model' : 'user';
      
      // Gemini history must start with a 'user' message
      if (formattedHistory.length === 0 && role === 'model') {
        continue;
      }
      
      // Gemini history must strictly alternate between user and model
      if (formattedHistory.length > 0 && formattedHistory[formattedHistory.length - 1].role === role) {
        // Append to the last message if the role is the same
        formattedHistory[formattedHistory.length - 1].parts[0].text += '\n\n' + msg.text;
      } else {
        formattedHistory.push({
          role: role,
          parts: [{ text: msg.text }]
        });
      }
    }

    const chat = model.startChat({
      history: formattedHistory,
      generationConfig: {
        maxOutputTokens: 300,
        temperature: 0.4,
      },
    });

    const result = await chat.sendMessage(message);
    const responseText = result.response.text();

    res.json({ response: responseText });
  } catch (error) {
    console.error('Chat API Error:', error);
    res.status(500).json({ 
      response: "I'm sorry, I'm having trouble connecting to the AI brain right now. Please try again in a moment or call 112 for immediate emergencies."
    });
  }
});

module.exports = router;
