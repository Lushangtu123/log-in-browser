const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;  // Changed to port 3001

// Middleware for parsing JSON and enabling CORS
app.use(express.json());
app.use(cors());

// Replace with your actual API key in a .env file
const API_KEY = process.env.API_KEY; // Store this securely, e.g., in environment variables
const SILICONFLOW_API_URL = 'https://api.siliconflow.cn/v1/chat/completions';

// Proxy endpoint for the chatbot API
app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Forward the request to SiliconFlow API
        const response = await axios.post(SILICONFLOW_API_URL, {
            model: "Qwen/Qwen2.5-7B-Instruct",
            messages: [{ role: "user", content: message }],
            stream: false,
            max_tokens: 512,
            temperature: 0.7,
            top_p: 0.7,
            top_k: 50,
            frequency_penalty: 0.5,
            n: 1
        }, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        // Send the response back to the frontend
        res.json(response.data);
    } catch (error) {
        console.error('Error calling SiliconFlow API:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
        res.status(500).json({ 
            error: 'An error occurred while processing your request',
            details: error.message,
            statusCode: error.response?.status
        });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
