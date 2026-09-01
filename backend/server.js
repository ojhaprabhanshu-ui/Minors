const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());


app.post('/api/generate-oa', async (req, res) => {
  const { candidateProfile } = req.body;

  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are an expert DSA interviewer. Output strictly valid JSON without markdown formatting or code blocks.'
          },
          {
            role: 'user',
            content: `Generate 3 completely unique DSA coding questions for profile: ${JSON.stringify(candidateProfile)}. 

Return a raw JSON array of objects with this structure:
[
  {
    "id": "q1",
    "title": "Problem Title",
    "topic": "Arrays & Hashing",
    "difficulty": "Easy",
    "description": "Problem text...",
    "constraints": ["1 <= nums.length <= 10^4"],
    "examples": [{"input": "nums = [2,7]", "output": "[0,1]"}],
    "functionName": "twoSum",
    "starterCode": {
      "python": "def twoSum(nums):\n    pass",
      "java": "class Solution {\n}",
      "cpp": "class Solution {\n};"
    },
    "testCases": {
      "public": [{"input": "[2,7]", "expected": "[0,1]"}],
      "hidden": [{"input": "[3,3]", "expected": "[0,1]"}]
    }
  }
]`
          }
        ],
        temperature: 0.8
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://vireza.com',
          'X-Title': 'VIREZA AI Interview'
        }
      }
    );

    let rawContent = response.data.choices[0].message.content;
    
    // Strip markdown formatting if returned by LLM
    rawContent = rawContent.replace(/```json|```/g, '').trim();
    
    const questions = JSON.parse(rawContent);
    return res.json({ success: true, questions });
  } catch (error) {
    console.error('Error in /api/generate-oa:', error.response?.data || error.message);
    return res.status(500).json({ success: false, message: 'Failed to generate questions.' });
  }
});

app.listen(PORT, () => {
  console.log(`VIREZA Backend running on http://localhost:${PORT}`);
});