import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Disable Caching globally for API
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.set('Surrogate-Control', 'no-store');
  next();
});

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'FictionZone API is running' });
});

import metadataRoutes from './routes/metadata.js';
import translationRoutes from './routes/translation.js';
import contentRoutes from './routes/content.js';
import apiV2Routes from './routes/api_v2.js';

app.use('/api/metadata', metadataRoutes);
app.use('/api/translate', translationRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/v2', apiV2Routes);

// For local development
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default app;
