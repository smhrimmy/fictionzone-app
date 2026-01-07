import { Router } from 'express';
import { AniListService } from '../services/anilist.js';
import { MangaDexService } from '../services/mangadex.js';
import { AO3Service } from '../services/ao3.js';
import { FanMTLService } from '../services/fanmtl.js';

const router = Router();

// GET /api/metadata/trending
router.get('/trending', async (req, res) => {
  const { type } = req.query;

  try {
    if (type === 'manga') {
       // Fetch trending manga from MangaDex
       const data = await MangaDexService.searchManga('', 10); // Empty query usually returns popular
       const results = data.data.map((m: any) => ({
         id: m.id,
         title: m.attributes.title.en || Object.values(m.attributes.title)[0],
         cover_image: MangaDexService.getCoverUrl(m) || '',
         description: m.attributes.description.en || '',
         source: 'mangadex',
         type: 'manga'
       }));
       res.json(results);
    } else {
       // Fetch trending novels using AniList (Fast & Reliable Metadata)
       // We'll use the 'NOVEL' format filter in AniList
       try {
           const data = await AniListService.search({
               query: undefined, // Trending/Popular usually implies no query
               type: 'MANGA',
               format: 'NOVEL',
               page: 1,
               perPage: 10
           });
           
           const results = data.media.map((item: any) => ({
             id: item.id.toString(), // Use AniList ID for display
             title: item.title.english || item.title.romaji || item.title.native,
             cover_image: item.coverImage.large,
             description: item.description,
             rating: item.averageScore ? item.averageScore / 10 : 0,
             views: item.popularity || 0, // Fix NaN issue
             chapters: item.chapters || 0,
             type: 'novel',
             source: 'anilist'
           }));
           
           // Sort: Items with chapters first (if available), then by popularity
           results.sort((a: any, b: any) => {
               if (a.chapters > 0 && b.chapters === 0) return -1;
               if (a.chapters === 0 && b.chapters > 0) return 1;
               return b.views - a.views;
           });
           
           res.json(results);
       } catch (e) {
           console.error('AniList Trending Failed', e);
           res.json([]); // Return empty instead of 500
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
  const searchQuery = query as string;

  try {
    if (!searchQuery) {
      return res.json({ results: [], pageInfo: {} });
    }

    if (type === 'manga') {
       // Use MangaDex
       const offset = (pageNum - 1) * perPage;
       const data = await MangaDexService.searchManga(searchQuery, perPage, offset);
       
       const results = data.data.map((m: any) => ({
         id: m.id,
         title: m.attributes.title.en || Object.values(m.attributes.title)[0],
         author: m.relationships.find((r: any) => r.type === 'author')?.attributes?.name || 'Unknown',
         description: m.attributes.description.en || 'No description',
         cover_image: MangaDexService.getCoverUrl(m) || '',
         status: m.attributes.status,
         type: 'manga',
         source: 'mangadex'
       }));

       res.json({ results, pageInfo: { total: data.total, hasNextPage: (offset + perPage) < data.total } });

    } else if (type === 'novel' || type === 'fanfiction') {
       // Try FanMTL first
       let results = [];
       try {
           results = await FanMTLService.search(searchQuery, pageNum);
       } catch (e) {
           console.warn('FanMTL Search Failed', e);
       }
       
       if (results.length === 0) {
           // Fallback to AO3
           try {
               results = await AO3Service.search(searchQuery, pageNum);
           } catch (e) {
               console.warn('AO3 Search Failed', e);
           }
       }

       res.json({ results, pageInfo: { hasNextPage: true } });
    } else {
       // Default to AniList
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
        // MangaDex
        // TODO: Implement getMangaById in MangaDexService if needed, or rely on search
        // For now, let's assume we can fetch by ID or return a placeholder if we have data on frontend
        // But frontend calls this.
        res.status(501).json({ error: 'Not implemented' });
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
                     author: { username: 'Unknown' }, // AniList requires separate query for staff usually
                     type: 'novel',
                     source: 'anilist'
                 });
             } else {
                 res.status(404).json({ error: 'Novel not found' });
             }
         } else {
            // FanMTL ID
            const details = await FanMTLService.getNovelDetails(id);
            res.json({
                ...details,
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
