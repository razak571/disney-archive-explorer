/**
 * Disney Character Model
 * Defines the shape of data coming from the Disney API
 */

export interface DisneyCharacter {
  _id: number;
  name: string;
  imageUrl: string;
  films: string[];
  tvShows: string[];
  videoGames: string[];
  shortFilms: string[];
  parkAttractions: string[];
  allies: string[];
  enemies: string[];
  url: string;
}

/**
 * API Response wrapper
 * The Disney API wraps data in { info, data } structure
 */
export interface DisneyApiResponse {
  info: {
    count: number;
    totalPages: number;
    previousPage: string | null;
    nextPage: string | null;
  };
  data: DisneyCharacter[];
}
