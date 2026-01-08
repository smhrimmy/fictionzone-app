import { NovelSource } from '../core/types.js';
import { FanMTLSource } from '../plugins/FanMTLSource.js';
import { MangaDexSource } from '../plugins/MangaDexSource.js';
import { AO3Source } from '../plugins/AO3Source.js';

export class SourceManager {
  private sources: Map<string, NovelSource> = new Map();

  constructor() {
    // Auto-register default sources
    this.registerSource(new FanMTLSource());
    this.registerSource(new MangaDexSource());
    this.registerSource(new AO3Source());
  }

  registerSource(source: NovelSource) {
    console.log(`[SourceManager] Registered plugin: ${source.name} (${source.id})`);
    this.sources.set(source.id, source);
  }

  getSource(id: string): NovelSource | undefined {
    return this.sources.get(id);
  }

  getAllSources(): NovelSource[] {
    return Array.from(this.sources.values());
  }

  getSourcesByType(type: 'novel' | 'manga'): NovelSource[] {
      return this.getAllSources().filter(s => s.type === type);
  }
}

export const sourceManager = new SourceManager();
