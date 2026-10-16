import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { generateProductCopy } from './src/server/geminiService.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// API endpoint for Gemini copy generation
app.post('/api/gemini/generate-copy', async (req, res) => {
  try {
    const result = await generateProductCopy(req.body);
    res.json(result);
  } catch (error: any) {
    console.error('Error generating product copy:', error);
    res.status(500).json({ error: error.message || 'Error interno al generar copy con IA' });
  }
});

// Serve frontend dist assets in production
app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`NexoDrop Colombia running on port ${PORT}`);
});
