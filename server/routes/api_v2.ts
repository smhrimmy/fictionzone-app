import { Router } from 'express';
import { sourceManager } from '../managers/SourceManager.js';

const router = Router();

// GET /sources
router.get('/sources', (req, res) => {
  const sources = sourceManager.getAllSources().map(s => ({
    id: s.id,
    name: s.name,
    version: s.version,
    type: s.type,
    icon: s.icon,
    baseurl: s.baseurl
  }));
  res.json(sources);
});

// GET /search?q=...&source=...
router.get('/search', async (req, res) => {
    const { q, source } = req.query;
    if (!q) return res.status(400).json({ error: 'Query required' });

    const query = q as string;
    
    // If source specified, search only that. Else search all (parallel).
    const sources = source ? [sourceManager.getSource(source as string)].filter(Boolean) : sourceManager.getAllSources();

    if (sources.length === 0) return res.status(404).json({ error: 'No valid sources found' });

    try {
        const results = await Promise.all(sources.map(async s => {
            try {
                return await s!.search({ query });
            } catch (e) {
                console.error(`Search failed for ${s!.id}`, e);
                return [];
            }
        }));
        
        // Flatten
        res.json(results.flat());
    } catch (e) {
        res.status(500).json({ error: 'Search failed' });
    }
});

// GET /novel/:source/:id
router.get('/novel/:source/:id', async (req, res) => {
  const { source, id } = req.params;
  const plugin = sourceManager.getSource(source);
  
  if (!plugin) {
    return res.status(404).json({ error: 'Source not found' });
  }

  try {
    const novel = await plugin.getNovelDetails(id);
    res.json(novel);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch novel' });
  }
});

// GET /chapter/:source/:novelId/:chapterId
router.get('/chapter/:source/:novelId/:chapterId', async (req, res) => {
    const { source, novelId, chapterId } = req.params;
    const plugin = sourceManager.getSource(source);

    if (!plugin) return res.status(404).json({ error: 'Source not found' });

    try {
        const chapter = await plugin.getChapterContent(novelId, chapterId);
        res.json(chapter);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch content' });
    }
});

export default router;
