import axios from 'axios';

const ANILIST_API_URL = 'https://graphql.anilist.co';

const SEARCH_QUERY = `
query ($search: String, $type: MediaType, $format: MediaFormat, $isAdult: Boolean, $page: Int, $perPage: Int) {
  Page (page: $page, perPage: $perPage) {
    pageInfo {
      total
      currentPage
      lastPage
      hasNextPage
      perPage
    }
    media (search: $search, type: $type, format: $format, isAdult: $isAdult, sort: POPULARITY_DESC) {
      id
      title {
        romaji
        english
        native
      }
      coverImage {
        extraLarge
        large
        medium
      }
      description
      status
      format
      chapters
      volumes
      genres
      averageScore
      isAdult
      bannerImage
    }
  }
}
`;

export interface SearchOptions {
  query: string;
  type?: 'MANGA' | 'ANIME'; // AniList types
  format?: 'NOVEL' | 'MANGA' | 'ONE_SHOT';
  isAdult?: boolean;
  page?: number;
  perPage?: number;
}

const GET_BY_ID_QUERY = `
query ($id: Int) {
  Media (id: $id) {
    id
    title {
      romaji
      english
      native
    }
    coverImage {
      extraLarge
      large
    }
    description
    status
    format
    chapters
    volumes
    genres
    averageScore
    isAdult
    bannerImage
    popularity
  }
}
`;

export class AniListService {
  static async getById(id: number) {
    try {
      const response = await axios.post(ANILIST_API_URL, {
        query: GET_BY_ID_QUERY,
        variables: { id }
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      });
      return response.data.data.Media;
    } catch (error) {
       console.error('AniList API Error:', error);
       return null;
    }
  }

  static async search(options: SearchOptions) {
    const { query, type = 'MANGA', format, isAdult, page = 1, perPage = 20 } = options;

    try {
      const variables: any = {
        search: query,
        type: type,
        page: page,
        perPage: perPage
      };

      if (format) variables.format = format;
      // If isAdult is explicitly provided, use it. Otherwise, AniList defaults to false usually, or mixed depending on user settings (but here it's an unauthed query)
      if (typeof isAdult === 'boolean') variables.isAdult = isAdult;

      const response = await axios.post(ANILIST_API_URL, {
        query: SEARCH_QUERY,
        variables
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      });

      return response.data.data.Page;
    } catch (error) {
      console.error('AniList API Error:', error);
      throw new Error('Failed to fetch data from AniList');
    }
  }
}
