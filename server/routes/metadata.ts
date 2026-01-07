import { Router } from 'express';
import { AniListService } from '../services/anilist';
import { MangaDexService } from '../services/mangadex';
import { AO3Service } from '../services/ao3';
import { FanMTLService } from '../services/fanmtl';

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
       // Fetch trending novels from FanMTL (Search empty query or scrape home)
       const results = await FanMTLService.search('system', 1); // "system" is a popular keyword to get trending-like results
       res.json(results);
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
       let results = await FanMTLService.search(searchQuery, pageNum);
       
       if (results.length === 0) {
           // Fallback to AO3
           results = await AO3Service.search(searchQuery, pageNum);
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

export default router;
