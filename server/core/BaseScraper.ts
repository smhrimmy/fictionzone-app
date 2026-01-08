import { NovelSource, Novel, Chapter, SearchOptions } from './types.js';
import axios, { AxiosInstance } from 'axios';
import * as cheerio from 'cheerio';

export abstract class BaseScraper implements NovelSource {
  abstract id: string;
  abstract name: string;
  abstract version: string;
  abstract baseurl: string;
  abstract type: 'novel' | 'manga';

  protected client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://google.com',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
  }

  abstract search(options: SearchOptions): Promise<Novel[]>;
  abstract getNovelDetails(id: string): Promise<Novel>;
  abstract getChapters(id: string): Promise<Chapter[]>;
  abstract getChapterContent(novelId: string, chapterId: string): Promise<Chapter>;

  protected loadHtml(html: string) {
    return cheerio.load(html);
  }
  
  protected async fetchHtml(url: string, config = {}) {
      const { data } = await this.client.get(url, config);
      return this.loadHtml(data);
  }
}
