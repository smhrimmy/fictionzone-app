import { Router } from 'express';
import { sourceManager } from '../managers/SourceManager.js';
import { AniListService } from '../services/anilist.js';

const router = Router();

// GET /api/metadata/trending
router.get('/trending', async (req, res) => {
  const { type } = req.query;

  try {
    if (type === 'manga') {
       // Fetch trending manga from MangaDex Plugin
       const source = sourceManager.getSource('mangadex');
       if (source) {
           const novels = await source.search({ query: '', limit: 10 });
           // Map to frontend expected format if needed, but Novel interface matches mostly
           const results = novels.map(n => ({
               ...n,
               cover_image: n.coverUrl, // Frontend expects snake_case
               type: 'manga',
               source: 'mangadex'
           }));
           res.json(results);
       } else {
           res.json([]);
       }
    } else {
       // Fetch trending novels using AniList (Fast & Reliable Metadata)
       try {
           const data = await AniListService.search({
               query: undefined, 
               type: 'MANGA',
               format: 'NOVEL',
               page: 1,
               perPage: 10
           });
           
           const results = data.media.map((item: any) => ({
             id: item.id.toString(),
             title: item.title.english || item.title.romaji || item.title.native,
             cover_image: item.coverImage.large,
             description: item.description,
             rating: item.averageScore ? item.averageScore / 10 : 0,
             views: item.popularity || 0,
             chapters: item.chapters || 0,
             type: 'novel',
             source: 'anilist'
           }));
           
           results.sort((a: any, b: any) => {
               if (a.chapters > 0 && b.chapters === 0) return -1;
               if (a.chapters === 0 && b.chapters > 0) return 1;
               return b.views - a.views;
           });
           
           res.json(results);
       } catch (e) {
           console.error('AniList Trending Failed', e);
           res.json([]); 
       }
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch trending' });
  }
});

// GET /api/metadata/search
router.get('/search', async (req, res) => {
  const { query, type, page, limit } = req.query;
  const pageNum = page ? parseInt(page as string) : 1;
  const perPage = limit ? parseInt(limit as string) : 20;
  const searchQuery = query as string || '';

  try {
    if (!searchQuery && type !== 'manga') { // MangaDex allows empty search for latest
      return res.json({ results: [], pageInfo: {} });
    }

    if (type === 'manga') {
       const source = sourceManager.getSource('mangadex');
       if (source) {
           const novels = await source.search({ query: searchQuery, page: pageNum, limit: perPage });
           const results = novels.map(n => ({
               ...n,
               cover_image: n.coverUrl,
               type: 'manga',
               source: 'mangadex'
           }));
           res.json({ results, pageInfo: { hasNextPage: true } }); // Todo: fix pagination
       } else {
           res.json({ results: [], pageInfo: {} });
       }

    } else if (type === 'novel' || type === 'fanfiction') {
       // FanMTL + AO3 via Plugins
       const fanmtl = sourceManager.getSource('fanmtl');
       const ao3 = sourceManager.getSource('ao3');
       
       let novels: any[] = [];
       try {
           if (fanmtl) novels = await fanmtl.search({ query: searchQuery, page: pageNum });
       } catch (e) { console.error('FanMTL search error', e); }

       if (novels.length === 0 && ao3) {
           try {
               novels = await ao3.search({ query: searchQuery, page: pageNum });
           } catch (e) { console.error('AO3 search error', e); }
       }

       const results = novels.map(n => ({
           ...n,
           cover_image: n.coverUrl,
           type: 'novel',
           source: n.sourceId
       }));

       res.json({ results, pageInfo: { hasNextPage: true } });
    } else {
       // AniList Fallback
       const data = await AniListService.search({
         query: searchQuery,
         type: 'MANGA',
         page: pageNum,
         perPage: perPage
       });
       
       const results = data.media.map((item: any) => ({
         id: item.id.toString(),
         title: item.title.english || item.title.romaji,
         cover_image: item.coverImage.large,
         description: item.description,
         type: 'anilist_fallback'
       }));
       
       res.json({ results, pageInfo: data.pageInfo });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch metadata' });
  }
});

// GET /api/metadata/:type/:id
router.get('/:type/:id', async (req, res) => {
  const { type, id } = req.params;

  try {
    if (type === 'manga') {
        const source = sourceManager.getSource('mangadex');
        if (source) {
            const novel = await source.getNovelDetails(id);
            res.json({
                ...novel,
                cover_image: novel.coverUrl,
                type: 'manga',
                source: 'mangadex',
                rating: 0,
                views: 0
            });
        } else {
            res.status(404).json({ error: 'Manga source not found' });
        }
    } else {
        // Novel
        if (!isNaN(Number(id))) {
             // AniList ID
             const item = await AniListService.getById(parseInt(id));
             
             if (item) {
                 res.json({
                     id: item.id.toString(),
                     title: item.title.english || item.title.romaji || item.title.native,
                     cover_image: item.coverImage.extraLarge || item.coverImage.large,
                     description: item.description,
                     status: item.status,
                     rating: item.averageScore ? item.averageScore / 10 : 0,
                     views: item.popularity || 0,
                     chapters_count: item.chapters || 0,
                     genres: item.genres || [],
                     author: { username: 'Unknown' }, 
                     type: 'novel',
                     source: 'anilist'
                 });
             } else {
                 res.status(404).json({ error: 'Novel not found' });
             }
         } else if (id.startsWith('ao3_')) {
             const source = sourceManager.getSource('ao3');
             const novel = await source!.getNovelDetails(id);
             res.json({
                 ...novel,
                 cover_image: novel.coverUrl,
                 type: 'novel',
                 source: 'ao3'
             });
         } else {
             // FanMTL
             const source = sourceManager.getSource('fanmtl');
             // Strip prefix if present for plugin call? 
             // Plugin expects ID. FanMTLSource usually handles ID without prefix?
             // Let's check FanMTLSource.ts. It expects raw ID in getNovelDetails logic (fetching url/novel/ID).
             // But my old code used "fanmtl_ID".
             // I need to strip "fanmtl_" before calling plugin if plugin expects raw ID.
             const rawId = id.replace('fanmtl_', '');
             const novel = await source!.getNovelDetails(rawId);
             res.json({
                ...novel,
                cover_image: novel.coverUrl,
                type: 'novel',
                source: 'fanmtl'
            });
        }
    }
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch details' });
  }
});

export default router;
