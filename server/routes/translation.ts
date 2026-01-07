import { Router } from 'express';
import multer from 'multer';
import { TranslationService } from '../services/translationService';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// POST /api/translate/text
router.post('/text', async (req, res) => {
  const { content, sourceLang, targetLang, type } = req.body;
  
  if (!content) {
    return res.status(400).json({ error: 'Content is required' });
  }

  try {
    const translatedText = await TranslationService.translateText(
        content, 
        sourceLang || 'auto', 
        targetLang || 'en',
        type || 'novel'
    );
    
    res.json({
      translatedText,
      originalText: content
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Translation failed' });
  }
});

// POST /api/translate/image
router.post('/image', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image provided' });
  }

  const { sourceLang, targetLang } = req.body;

  try {
    const result = await TranslationService.translateImage(
        req.file.buffer,
        sourceLang || 'jpn', // Default to Japanese for Manga
        targetLang || 'eng'
    );

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Image translation failed' });
  }
});

export default router;
