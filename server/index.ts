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

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'FictionZone API is running' });
});

import metadataRoutes from './routes/metadata';
import translationRoutes from './routes/translation';
import contentRoutes from './routes/content';

app.use('/api/metadata', metadataRoutes);
app.use('/api/translate', translationRoutes);
app.use('/api/content', contentRoutes);

// For local development
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default app;
