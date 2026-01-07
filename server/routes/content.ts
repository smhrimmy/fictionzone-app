import { Router } from 'express';
import { MangaDexService } from '../services/mangadex.js';
import { AO3Service } from '../services/ao3.js';
import { FanMTLService } from '../services/fanmtl.js';
import { AniListService } from '../services/anilist.js';

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
    } else if (!isNaN(Number(storyId)) && !storyId.includes('-')) {
       // Numeric ID = AniList (likely)
       // 1. Get Title from AniList
       // Note: We don't have a direct getById in AniListService yet, usually we search.
       // Let's implement a quick fetch or assume we search by ID if needed, but search usually works.
       // For now, let's try to search FanMTL using the ID? No.
       // We need to resolve AniList ID to FanMTL.
       
       // Fallback: If we can't easily resolve, return empty or try to search if title was passed (not possible in GET param easily without query)
       // Ideally frontend passes title in query param?
       const { title } = req.query;
       
       if (title) {
           const results = await FanMTLService.search(title as string, 1);
           if (results.length > 0) {
               const fanmtlId = results[0].id;
               const details = await FanMTLService.getNovelDetails(fanmtlId);
               res.json(details.chapters || []);
               return;
           }
       }
       res.json([]);
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
            chapter_number: 0,
            content: data.content,
            published_at: new Date().toISOString()
        });
    } else if (!isNaN(Number(storyId)) && !storyId.includes('-')) {
        // AniList ID - Resolve to FanMTL
        const aniListMedia = await AniListService.getById(parseInt(storyId));
        if (aniListMedia) {
               // Strategy: Try English title, then Romaji title to find the novel on FanMTL
               let results = [];
               
               // 1. Try English Title
               if (aniListMedia.title.english) {
                   // Remove " (Novel)" or similar suffixes that might confuse search
                   const cleanTitle = aniListMedia.title.english.replace(/\(Novel\)/i, '').trim();
                   results = await FanMTLService.search(cleanTitle, 1);
               }

               // 2. Try Romaji Title if English failed
               if (results.length === 0 && aniListMedia.title.romaji) {
                   const cleanTitle = aniListMedia.title.romaji.replace(/\(Novel\)/i, '').trim();
                   results = await FanMTLService.search(cleanTitle, 1);
               }
               
               // 3. Try Native Title (rarely works but worth a shot for raw scrapers)
               if (results.length === 0 && aniListMedia.title.native) {
                   results = await FanMTLService.search(aniListMedia.title.native, 1);
               }
               
               if (results.length > 0) {
                   const fanmtlId = results[0].id;
                   const data = await FanMTLService.getChapterContent(fanmtlId, chapterId);
                   res.json({
                      id: chapterId,
                      title: data.title,
                      chapter_number: 0,
                      content: data.content,
                      published_at: new Date().toISOString()
                   });
                   return;
               }
               
               // Fallback to AO3
               // Note: chapterId from frontend is likely "1" or "chapter-1". AO3 expects index "1".
               const chapNum = parseInt(chapterId.match(/\d+/)?.[0] || '1');
               
               // Same search strategy for AO3
               let ao3Results = [];
               if (aniListMedia.title.english) ao3Results = await AO3Service.search(aniListMedia.title.english, 1);
               if (ao3Results.length === 0 && aniListMedia.title.romaji) ao3Results = await AO3Service.search(aniListMedia.title.romaji, 1);

               if (ao3Results.length > 0) {
                   const ao3Id = ao3Results[0].id; // "ao3_12345"
                   const data = await AO3Service.getChapter(ao3Id, chapNum);
                   res.json({
                       id: chapterId,
                       title: data.title,
                       chapter_number: chapNum,
                       content: data.content,
                       published_at: new Date().toISOString()
                   });
                   return;
               }
          }
          res.status(404).json({ error: 'Content not found via resolution' });
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
