import { BaseScraper } from '../core/BaseScraper.js';
import { Novel, Chapter, SearchOptions } from '../core/types.js';

export class FanMTLSource extends BaseScraper {
  id = 'fanmtl';
  name = 'FanMTL';
  version = '1.0.0';
  baseurl = 'https://fanmtl.com';
  type = 'novel' as const;

  constructor() {
      super();
      this.client.defaults.headers.common['Referer'] = this.baseurl;
  }

  async search(options: SearchOptions): Promise<Novel[]> {
    const { query } = options;
    const { data } = await this.client.get(`${this.baseurl}/`, {
        params: { s: query, post_type: 'wp-manga' }
    });
    
    const $ = this.loadHtml(data);
    const results: Novel[] = [];

    $('.c-tabs-item__content').each((_, el) => {
        const titleEl = $(el).find('.post-title h3 a');
        const title = titleEl.text().trim();
        const url = titleEl.attr('href');
        const id = url ? url.split('/novel/')[1]?.replace(/\/$/, '') : null;
        const cover = $(el).find('.tab-thumb img').attr('src') || $(el).find('.tab-thumb img').attr('data-src');
        const rating = $(el).find('.score').text().trim();

        if (id && title) {
            results.push({
                id: id,
                title,
                author: $(el).find('.mg_author .summary-content').text().trim() || 'Unknown',
                description: 'Read on FanMTL',
                coverUrl: cover || '',
                status: 'Ongoing',
                sourceId: this.id,
                url: url || '',
                tags: [],
                rating: parseFloat(rating) || 0
            });
        }
    });

    return results;
  }

  async getNovelDetails(id: string): Promise<Novel> {
    const $ = await this.fetchHtml(`${this.baseurl}/novel/${id}`);
    
    const title = $('.post-title h1').text().trim();
    const cover = $('.summary_image img').attr('src') || $('.summary_image img').attr('data-src');
    const author = $('.author-content a').text().trim();
    const description = $('.summary__content').text().trim();
    const genres = $('.genres-content a').map((_, el) => $(el).text()).get();
    const statusText = $('.post-status .summary-content').text().trim();
    const status = statusText.includes('Completed') ? 'Completed' : 'Ongoing';

    // Parse chapters (HTML list)
    let chapters: Chapter[] = [];
    $('.wp-manga-chapter').each((_, el) => {
        const a = $(el).find('a');
        const chapUrl = a.attr('href');
        if (chapUrl) {
            const parts = chapUrl.split('/').filter(p => p);
            const chapId = parts[parts.length - 1];
            chapters.push({
                id: chapId,
                novelId: id,
                title: a.text().trim(),
                chapterNumber: chapters.length + 1,
                releaseDate: $(el).find('.chapter-release-date').text().trim(),
                url: chapUrl
            });
        }
    });

    // Fallback AJAX check (Simplified for plugin demo)
    if (chapters.length === 0) {
        // In a real plugin, we would implement the AJAX call here as done in the service
    }

    return {
        id,
        title,
        author,
        description,
        coverUrl: cover || '',
        status,
        sourceId: this.id,
        url: `${this.baseurl}/novel/${id}`,
        tags: genres,
        chapters: chapters.reverse()
    };
  }

  async getChapters(id: string): Promise<Chapter[]> {
      const novel = await this.getNovelDetails(id);
      return novel.chapters || [];
  }

  async getChapterContent(novelId: string, chapterId: string): Promise<Chapter> {
      const url = `${this.baseurl}/novel/${novelId}/${chapterId}`;
      console.log(`[FanMTL] Fetching content from ${url}`);
      try {
          const $ = await this.fetchHtml(url);

          const title = $('#chapter-heading').text().trim() || $('.breadcrumb li.active').text().trim();
          
          let content = $('.reading-content').html();
          if (!content) content = $('.text-left').html();
          if (!content) content = $('.entry-content').html();

          if (content) {
              const $c = this.loadHtml(content);
              $c('script, .adsbygoogle, div[class*="ad"]').remove();
              content = $c.html();
          } else {
              console.warn(`[FanMTL] No content found for ${url}`);
          }

          return {
              id: chapterId,
              novelId,
              title,
              chapterNumber: 0,
              content: content || '',
              url
          };
      } catch (e) {
          console.error(`[FanMTL] Failed to fetch content for ${url}`, e);
          throw e;
      }
  }
}
