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
                const chapId = chapUrl.split('/novel/')[1].replace(realId + '/', '').replace(/\/$/, '');
                chapters.push({
                    id: `fanmtl_c_${realId}_${chapId}`,
                    title: chapTitle,
                    chapter_number: chapters.length + 1, // Reverse order usually
                    published_at: $(el).find('.chapter-release-date').text().trim()
                });
            }
        });

        // If AJAX is needed, we might need a separate call, but for MVP let's hope for HTML list
        // Often "ajax_load_chapters" is used.
        
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
      // chapterId comes as "fanmtl_c_novelId_chapterSlug" or just "chapterSlug" if we parsed it that way
      // let's assume we pass the full slug
      const realNovelId = novelId.replace('fanmtl_', '');
      const realChapterId = chapterId.replace(`fanmtl_c_${realNovelId}_`, '').replace('fanmtl_', ''); // cleanup

      try {
          const url = `${BASE_URL}/novel/${realNovelId}/${realChapterId}`;
          const response = await axios.get(url, { headers: HEADERS });
          const $ = cheerio.load(response.data);

          const title = $('#chapter-heading').text().trim();
          const content = $('.reading-content').html(); // This contains the p tags

          return {
              id: chapterId,
              title,
              content,
              source: 'fanmtl'
          };
      } catch (error) {
          console.error('FanMTL Content Error:', error);
          throw error;
      }
  }
}
