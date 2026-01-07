import axios from 'axios';
import * as cheerio from 'cheerio';

const BASE_URL = 'https://archiveofourown.org';

export class AO3Service {
  
  static async search(query: string, page: number = 1) {
    try {
      const response = await axios.get(`${BASE_URL}/works/search`, {
        params: {
          'work_search[query]': query,
          'page': page
        }
      });
      
      const $ = cheerio.load(response.data);
      const results: any[] = [];

      $('li.work.blurb').each((_, el) => {
        const id = $(el).attr('id')?.replace('work_', '');
        const title = $(el).find('h4.heading a').first().text().trim();
        const author = $(el).find('h4.heading a[rel="author"]').text().trim() || 'Anonymous';
        const fandoms = $(el).find('h5.fandoms a').map((_, f) => $(f).text()).get();
        const summary = $(el).find('blockquote.userstuff').text().trim();
        const stats = $(el).find('dl.stats');
        const chapters = stats.find('dd.chapters').text().trim();
        const hits = stats.find('dd.hits').text().trim();

        if (id && title) {
          results.push({
            id: `ao3_${id}`,
            title,
            author,
            description: summary,
            cover_image: '', // AO3 doesn't have standard covers, handle in frontend
            genres: fandoms,
            chapters_count: chapters.split('/')[0],
            views: hits,
            source: 'ao3'
          });
        }
      });

      return results;
    } catch (error) {
      console.error('AO3 Search Error:', error);
      return [];
    }
  }

  static async getChapter(workId: string, chapterIndex: number = 1) {
    // workId comes as "ao3_12345"
    const realId = workId.replace('ao3_', '');
    
    try {
      // AO3 displays full work or chapters. 
      // To get specific chapter, we usually navigate to /works/ID/chapters/ID
      // But initially we might just fetch the work page which redirects to ch1
      
      // Let's just fetch the work with ?view_full_work=true for simplicity if it's a one-shot, 
      // or try to find the chapter list.
      
      // For this MVP, let's fetch the "Navigate" page to find chapter IDs if > 1 chapter
      // OR simpler: just fetch /works/{id}?view_full_work=true and parse the whole thing, 
      // splitting by chapter modules.
      
      const response = await axios.get(`${BASE_URL}/works/${realId}`, {
        params: { view_full_work: 'true', view_adult: 'true' },
         headers: { 'Cookie': 'view_adult=true' } // Bypass adult warning
      });

      const $ = cheerio.load(response.data);
      const title = $('h2.title').text().trim();
      
      // Find all chapter contents
      // In full work view, chapters are in <div id="chapter_1"> etc.
      
      // If chapterIndex provided, find that specific one.
      // Note: frontend sends 1-based index usually.
      
      // If it's a multi-chapter work in full view:
      const chapterDiv = $(`#chapter_${chapterIndex}`);
      
      let content = '';
      let chapterTitle = '';

      if (chapterDiv.length > 0) {
         // Multi-chapter
         chapterTitle = chapterDiv.find('.title').text().trim();
         content = chapterDiv.find('.userstuff').html() || '';
      } else {
         // Single chapter work or just main content
         // Look for the main userstuff div
         content = $('div.userstuff').first().html() || '';
         chapterTitle = title;
      }

      if (!content) throw new Error('Content not found');

      return {
        id: `c_${workId}_${chapterIndex}`,
        title: chapterTitle || `Chapter ${chapterIndex}`,
        content,
        chapter_number: chapterIndex
      };

    } catch (error) {
      console.error('AO3 Chapter Error:', error);
      throw error;
    }
  }
}
