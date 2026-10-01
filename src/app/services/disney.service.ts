import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay, map, catchError, of } from 'rxjs';
import { DisneyCharacter, DisneyApiResponse } from '../models/character.model';

/**
 * DisneyService — Service Layer for API Communication
 *
 * WHY a service?
 * - Single Responsibility: Only this file talks to the API
 * - Scalability: If the API changes, we update ONE file
 * - Caching: shareReplay(1) ensures we fetch data ONCE, not on every component mount
 * - Testability: Easy to mock in unit tests
 */
@Injectable({
  providedIn: 'root' // Singleton — one instance shared across entire app
})
export class DisneyService {

  private readonly API_URL = 'https://api.disneyapi.dev/character';
  private readonly PAGE_SIZE = 10000;

  /**
   * Cached observable of ALL characters
   * shareReplay(1) = cache the last emission, replay to new subscribers
   * This means: first component that subscribes triggers the HTTP call,
   * all subsequent subscribers get the cached result instantly
   */
  private allCharacters$: Observable<DisneyCharacter[]>;

  constructor(private http: HttpClient) {
    this.allCharacters$ = this.http
      .get<DisneyApiResponse>(`${this.API_URL}?pageSize=${this.PAGE_SIZE}`)
      .pipe(
        map(response => response.data),
        // Filter out characters without images (bad data)
        map(characters => characters.filter(c => c.imageUrl && c.name)),
        catchError(error => {
          console.error('Failed to fetch Disney characters:', error);
          return of([]); // Return empty array on error — graceful degradation
        }),
        shareReplay(1) // Cache the result
      );
  }

  /**
   * Get all Disney characters (cached)
   * Components call this — they never know about HTTP details
   */
  getAllCharacters(): Observable<DisneyCharacter[]> {
    return this.allCharacters$;
  }

  /**
   * Get a single character by ID
   * Finds from cached data instead of making another API call — performance optimization
   */
  getCharacterById(id: number): Observable<DisneyCharacter | undefined> {
    return this.allCharacters$.pipe(
      map(characters => characters.find(c => c._id === id))
    );
  }
}
