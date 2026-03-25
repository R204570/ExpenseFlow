import { Router } from 'express';
import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// POST /api/ai/process-receipt
router.post('/process-receipt', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'OCR text is required' });
    }

    const prompt = `You are an expert receipt/bill data extractor. Analyze the following OCR text from a receipt or bill and extract structured data.

OCR Text:
"""
${text.trim()}
"""

Extract the following information and return ONLY valid JSON (no extra text, no markdown, no code blocks):

{
  "date": "YYYY-MM-DD format or null if not found",
  "merchant": "store/restaurant name or null",
  "amount": total amount as a number or null,
  "category": "one of: Food & Dining, Groceries, Transportation, Shopping, Entertainment, Healthcare, Utilities, Education, Travel, Other",
  "items": [
    { "name": "item description", "price": price_as_number }
  ]
}

Rules:
- Always return valid JSON
- Use null for fields you cannot determine
- Amount should be a number (not string)
- Items prices should be numbers
- If no items are found, return empty array for items
- Category must be one of the specified options
- Date must be in YYYY-MM-DD format`;

    let fullContent = '';

    const completion = await groq.chat.completions.create({
      model: 'openai/gpt-oss-120b',
      messages: [
        {
          role: 'system',
          content: 'You are a receipt data extraction API. You ONLY respond with valid JSON. No explanations, no markdown.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_completion_tokens: 2048,
      top_p: 1,
      stream: false
    });

    fullContent = completion.choices[0]?.message?.content || '';

    // Clean up the response - remove any markdown code blocks
    fullContent = fullContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    let parsed;
    try {
      parsed = JSON.parse(fullContent);
    } catch (parseErr) {
      console.error('Failed to parse AI response:', fullContent);
      // Attempt to extract JSON from the response
      const jsonMatch = fullContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          parsed = JSON.parse(jsonMatch[0]);
        } catch {
          return res.status(422).json({
            error: 'Failed to parse AI response',
            raw: fullContent
          });
        }
      } else {
        return res.status(422).json({
          error: 'AI did not return valid JSON',
          raw: fullContent
        });
      }
    }

    // Sanitize and validate the output
    const result = {
      date: parsed.date || null,
      merchant: parsed.merchant || null,
      amount: parsed.amount !== null && parsed.amount !== undefined ? Number(parsed.amount) : null,
      category: parsed.category || 'Other',
      items: Array.isArray(parsed.items) ? parsed.items.map(item => ({
        name: String(item.name || 'Unknown item'),
        price: Number(item.price) || 0
      })) : []
    };

    res.json(result);
  } catch (error) {
    console.error('AI processing error:', error);
    res.status(500).json({
      error: 'AI processing failed. You can enter details manually.',
      details: error.message
    });
  }
});

export default router;
