import axios from 'axios';
import * as cheerio from 'cheerio';

const BASE_URL = 'https://fanmtl.com';

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.5',
  'Referer': BASE_URL
};

export class FanMTLService {
  
  static async search(query: string, page: number = 1) {
    try {
      const response = await axios.get(`${BASE_URL}/`, {
        params: {
          s: query,
          post_type: 'wp-manga'
        },
        headers: HEADERS
      });
      
      const $ = cheerio.load(response.data);
      const results: any[] = [];

      $('.c-tabs-item__content').each((_, el) => {
        const titleEl = $(el).find('.post-title h3 a');
        const title = titleEl.text().trim();
        const url = titleEl.attr('href');
        const id = url ? url.split('/novel/')[1]?.replace(/\/$/, '') : null;
        const cover = $(el).find('.tab-thumb img').attr('src') || $(el).find('.tab-thumb img').attr('data-src');
        const rating = $(el).find('.score').text().trim();
        const latestChap = $(el).find('.latest-chap .chapter a').text().trim();
        
        if (id && title) {
          results.push({
            id: `fanmtl_${id}`,
            title,
            author: $(el).find('.mg_author .summary-content').text().trim() || 'Unknown',
            description: 'Read on FanMTL', // Search results often lack full desc
            cover_image: cover,
            status: 'Ongoing', // Default
            rating: parseFloat(rating) || 0,
            chapters_count: latestChap,
            source: 'fanmtl',
            type: 'novel'
          });
        }
      });

      return results;
    } catch (error) {
      console.error('FanMTL Search Error:', error);
      return [];
    }
  }

  static async getNovelDetails(id: string) {
    const realId = id.replace('fanmtl_', '');
    try {
        const response = await axios.get(`${BASE_URL}/novel/${realId}`, { headers: HEADERS });
        const $ = cheerio.load(response.data);
        
        const title = $('.post-title h1').text().trim();
        const cover = $('.summary_image img').attr('src') || $('.summary_image img').attr('data-src');
        const author = $('.author-content a').text().trim();
        const description = $('.summary__content').text().trim();
        const genres = $('.genres-content a').map((_, el) => $(el).text()).get();
        const status = $('.post-status .summary-content').text().trim();

        // Chapters - Madara themes often load chapters via AJAX to /wp-admin/admin-ajax.php
        // but sometimes they are in the HTML. Let's check HTML first.
        let chapters: any[] = [];
        
        // Check for direct list
        $('.wp-manga-chapter').each((_, el) => {
            const a = $(el).find('a');
            const chapTitle = a.text().trim();
            const chapUrl = a.attr('href');
            if (chapUrl) {
                // chapUrl example: https://fanmtl.com/novel/my-novel/chapter-1/
                const parts = chapUrl.split('/').filter(p => p);
                const chapId = parts[parts.length - 1]; // last part is slug
                
                chapters.push({
                    id: chapId, // Just use the slug, we construct url in getChapterContent
                    title: chapTitle,
                    chapter_number: chapters.length + 1,
                    published_at: $(el).find('.chapter-release-date').text().trim()
                });
            }
        });

        // If no chapters found, try AJAX (Madara Theme)
        if (chapters.length === 0) {
            try {
                // Find numeric ID
                // <link rel="shortlink" href="https://fanmtl.com/?p=12345">
                const shortlink = $('link[rel="shortlink"]').attr('href');
                const numericId = shortlink ? shortlink.split('=')[1] : null;

                if (numericId) {
                    const ajaxRes = await axios.post(`${BASE_URL}/wp-admin/admin-ajax.php`, 
                        new URLSearchParams({
                            action: 'manga_get_chapters',
                            manga: numericId
                        }), {
                            headers: {
                                ...HEADERS,
                                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                                'X-Requested-With': 'XMLHttpRequest'
                            }
                        }
                    );
                    
                    const $ajax = cheerio.load(ajaxRes.data);
                    $ajax('.wp-manga-chapter').each((_, el) => {
                        const a = $ajax(el).find('a');
                        const chapTitle = a.text().trim();
                        const chapUrl = a.attr('href');
                        if (chapUrl) {
                             const parts = chapUrl.split('/').filter(p => p);
                             const chapId = parts[parts.length - 1];
                             chapters.push({
                                id: chapId,
                                title: chapTitle,
                                chapter_number: 0,
                                published_at: $ajax(el).find('.chapter-release-date').text().trim()
                             });
                        }
                    });
                }
            } catch (e) {
                console.warn('FanMTL AJAX Chapters Failed', e);
            }
        }
        
        return {
            id: `fanmtl_${realId}`,
            title,
            cover_image: cover,
            author: { id: 'unknown', username: author },
            description,
            genres,
            status,
            chapters: chapters.reverse() // Usually listed newest first
        };

    } catch (error) {
        console.error('FanMTL Details Error:', error);
        throw error;
    }
  }

  static async getChapterContent(novelId: string, chapterId: string) {
      // chapterId is now just the slug e.g. "chapter-1"
      const realNovelId = novelId.replace('fanmtl_', '');
      const realChapterId = chapterId.replace('fanmtl_', ''); // ensure clean

      try {
          const url = `${BASE_URL}/novel/${realNovelId}/${realChapterId}`;
          const response = await axios.get(url, { headers: HEADERS });
          const $ = cheerio.load(response.data);

          const title = $('#chapter-heading').text().trim() || $('.breadcrumb li.active').text().trim();
          
          // Try multiple selectors for content
          let content = $('.reading-content').html();
          if (!content) content = $('.text-left').html();
          if (!content) content = $('.entry-content').html();

          // Clean up content (remove ads, scripts)
          if (content) {
              const $content = cheerio.load(content);
              $content('script').remove();
              $content('.adsbygoogle').remove();
              $content('div[class*="ad"]').remove();
              content = $content.html();
          }

          return {
              id: chapterId,
              title,
              content: content || '<p>Content not found. Please try opening the original link.</p>',
              source: 'fanmtl'
          };
      } catch (error) {
          console.error('FanMTL Content Error:', error);
          throw error;
      }
  }
}
