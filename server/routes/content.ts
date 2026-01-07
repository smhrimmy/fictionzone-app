import { Router } from 'express';
import { MangaDexService } from '../services/mangadex';
import { AO3Service } from '../services/ao3';
import { FanMTLService } from '../services/fanmtl';

const router = Router();

// GET /api/content/chapters/:storyId
router.get('/chapters/:storyId', async (req, res) => {
  const { storyId } = req.params;

  try {
    if (storyId.startsWith('ao3_')) {
       // AO3 handling
       res.json([{ id: '1', chapter_number: 1, title: 'Full Work / Chapter 1' }]);
    } else if (storyId.startsWith('fanmtl_')) {
       // FanMTL handling
       const details = await FanMTLService.getNovelDetails(storyId);
       res.json(details.chapters || []);
    } else {
       // MangaDex
       const data = await MangaDexService.getChapters(storyId);
       
       const chapters = data.data.map((ch: any) => ({
         id: ch.id,
         title: ch.attributes.title || `Chapter ${ch.attributes.chapter}`,
         chapter_number: ch.attributes.chapter,
         pages: ch.attributes.pages,
         published_at: ch.attributes.publishAt
       }));
       
       res.json(chapters);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch chapters' });
  }
});

// GET /api/content/chapter/:storyId/:chapterId
router.get('/chapter/:storyId/:chapterId', async (req, res) => {
  const { storyId, chapterId } = req.params;

  try {
    if (storyId.startsWith('ao3_')) {
        // Fetch text content
        const chapterIndex = parseInt(chapterId); // simple mapping
        const data = await AO3Service.getChapter(storyId, chapterIndex);
        res.json(data);
    } else if (storyId.startsWith('fanmtl_')) {
        // FanMTL Content
        const data = await FanMTLService.getChapterContent(storyId, chapterId);
        res.json({
            id: chapterId,
            title: data.title,
            chapter_number: 0, // Need to parse from title if possible
            content: data.content,
            published_at: new Date().toISOString()
        });
    } else {
        // MangaDex - Fetch Pages
        const pages = await MangaDexService.getChapterPages(chapterId);
        res.json({
            id: chapterId,
            images: pages
        });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch chapter content' });
  }
});

export default router;
