import { BaseScraper } from '../core/BaseScraper.js';
import { Novel, Chapter, SearchOptions } from '../core/types.js';

export class AO3Source extends BaseScraper {
  id = 'ao3';
  name = 'Archive of Our Own';
  version = '1.0.0';
  baseurl = 'https://archiveofourown.org';
  type = 'novel' as const;

  constructor() {
      super();
      this.client.defaults.headers.common['Cookie'] = 'view_adult=true';
  }

  async search(options: SearchOptions): Promise<Novel[]> {
    const { query, page = 1 } = options;
    const { data } = await this.client.get(`${this.baseurl}/works/search`, {
        params: {
            'work_search[query]': query,
            'page': page
        }
    });

    const $ = this.loadHtml(data);
    const results: Novel[] = [];

    $('li.work.blurb').each((_, el) => {
        const idRaw = $(el).attr('id')?.replace('work_', '');
        const title = $(el).find('h4.heading a').first().text().trim();
        const author = $(el).find('h4.heading a[rel="author"]').text().trim() || 'Anonymous';
        const summary = $(el).find('blockquote.userstuff').text().trim();
        const stats = $(el).find('dl.stats');
        const chaptersText = stats.find('dd.chapters').text().trim();
        const hits = stats.find('dd.hits').text().trim();

        if (idRaw && title) {
            results.push({
                id: `ao3_${idRaw}`, // Prefix to avoid collisions in unified ID space if needed, though sourceId handles it. Let's keep raw ID for plugin.
                // Actually, standard practice: Plugin returns RAW ID. SourceManager handles namespacing if needed.
                // But legacy app uses 'ao3_' prefix. I will use RAW ID here for purity, but be aware.
                // WAIT: If I use raw ID '12345', it might clash with other numeric IDs.
                // Let's stick to raw ID '12345' and let the frontend/manager handle source distinction.
                // REVISION: The interface expects `id` string.
                title,
                author,
                description: summary,
                coverUrl: '',
                status: chaptersText.includes('?') ? 'Ongoing' : 'Completed',
                sourceId: this.id,
                url: `${this.baseurl}/works/${idRaw}`,
                tags: $(el).find('h5.fandoms a').map((_, f) => $(f).text()).get(),
                views: parseInt(hits) || 0
            });
        }
    });

    return results;
  }

  async getNovelDetails(id: string): Promise<Novel> {
    const realId = id.replace('ao3_', ''); // Handle legacy prefix if passed
    const { data } = await this.client.get(`${this.baseurl}/works/${realId}?view_adult=true`);
    const $ = this.loadHtml(data);

    const title = $('h2.title').first().text().trim();
    const author = $('h3.byline a').first().text().trim() || 'Anonymous';
    const description = $('.summary blockquote.userstuff').text().trim();
    const stats = $('dl.stats');
    const chaptersText = stats.find('dd.chapters').text().trim(); 
    const totalChapters = parseInt(chaptersText.split('/')[0]) || 1;

    // AO3 doesn't list chapters on the main page easily without navigation.
    // For this implementation, we generate the list based on the count.
    const chapters: Chapter[] = [];
    for (let i = 1; i <= totalChapters; i++) {
        chapters.push({
            id: i.toString(),
            novelId: id,
            title: `Chapter ${i}`,
            chapterNumber: i,
            url: `${this.baseurl}/works/${realId}/chapters/${i}` // Approximation
        });
    }

    return {
        id,
        title,
        author,
        description,
        coverUrl: '',
        status: chaptersText.includes('?') ? 'Ongoing' : 'Completed',
        sourceId: this.id,
        url: `${this.baseurl}/works/${realId}`,
        tags: [],
        chapters
    };
  }

  async getChapters(id: string): Promise<Chapter[]> {
      const novel = await this.getNovelDetails(id);
      return novel.chapters || [];
  }

  async getChapterContent(novelId: string, chapterId: string): Promise<Chapter> {
      const realNovelId = novelId.replace('ao3_', '');
      const chapterIndex = parseInt(chapterId);

      // Fetch full work to extract specific chapter
      // Optimization: AO3 allows /works/ID?view_full_work=true
      const { data } = await this.client.get(`${this.baseurl}/works/${realNovelId}?view_full_work=true&view_adult=true`);
      const $ = this.loadHtml(data);

      let content = '';
      let title = '';

      // Check if it's a multi-chapter work
      const chapterDiv = $(`#chapter_${chapterIndex}`);
      
      if (chapterDiv.length > 0) {
          title = chapterDiv.find('.title').text().trim();
          content = chapterDiv.find('.userstuff').html() || '';
      } else {
          // Single chapter or main content
          content = $('div.userstuff').first().html() || '';
          title = $('h2.title').first().text().trim();
      }

      return {
          id: chapterId,
          novelId,
          title: title || `Chapter ${chapterId}`,
          chapterNumber: chapterIndex,
          content: content || 'Content not found'
      };
  }
}
