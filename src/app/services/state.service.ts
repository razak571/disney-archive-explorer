import { Injectable, signal, computed } from '@angular/core';
import { DisneyCharacter } from '../models/character.model';
import { DisneyService } from './disney.service';
import { FavoritesService } from './favorites.service';

/**
 * StateService — Central State Management
 *
 * WHY centralize state?
 * - Single source of truth for ALL app state
 * - Components don't manage their own data — they just read from here
 * - Easy to debug: all state changes happen in one place
 * - Scalability: adding new filters/features = add a signal here
 *
 * SIGNALS OVERVIEW:
 * - signal(): creates reactive state variables
 * - computed(): creates derived state that automatically recomputes on dependency changes
 * - effect(): handles reactive side effects
 */
@Injectable({
  providedIn: 'root'
})
export class StateService {

  /** All characters from API (loaded once) */
  readonly allCharacters = signal<DisneyCharacter[]>([]);

  /** Loading state */
  readonly isLoading = signal<boolean>(true);

  /** Error state */
  readonly error = signal<string | null>(null);

  /** Current search term */
  readonly searchTerm = signal<string>('');

  /** Toggle: show only characters that appear in films */
  readonly showMovieStarsOnly = signal<boolean>(false);

  /** Toggle: show only favorites */
  readonly showFavoritesOnly = signal<boolean>(false);

  /**
   * COMPUTED: Filtered characters based on all active filters
   * This auto-recalculates whenever ANY dependency signal changes
   * (searchTerm, showMovieStarsOnly, showFavoritesOnly, or allCharacters)
   */
  readonly filteredCharacters = computed(() => {
    let result = this.allCharacters();

    // Filter by search term
    const term = this.searchTerm().toLowerCase().trim();
    if (term) {
      result = result.filter(character =>
        character.name.toLowerCase().includes(term)
      );
    }

    // Filter: show only movie stars (characters with at least 1 film)
    if (this.showMovieStarsOnly()) {
      result = result.filter(character => character.films.length > 0);
    }

    // Filter: show only favorites
    if (this.showFavoritesOnly()) {
      const favoriteIds = this.favoritesService.getFavoriteIds();
      result = result.filter(character => favoriteIds.includes(character._id));
    }

    return result;
  });

  /** COMPUTED: Total count of filtered results (for display) */
  readonly filteredCount = computed(() => this.filteredCharacters().length);

  /** COMPUTED: Total count of all characters */
  readonly totalCount = computed(() => this.allCharacters().length);

  constructor(
    private disneyService: DisneyService,
    private favoritesService: FavoritesService
  ) {
    this.loadCharacters();
  }

  /**
   * Load characters from API via the service layer
   * Called once during initialization
   */
  private loadCharacters(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.disneyService.getAllCharacters().subscribe({
      next: (characters) => {
        this.allCharacters.set(characters);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load characters. Please try again.');
        this.isLoading.set(false);
        console.error('StateService: Error loading characters', err);
      }
    });
  }

  /**
   * Update search term — called by search bar component
   */
  setSearchTerm(term: string): void {
    this.searchTerm.set(term);
  }

  /**
   * Toggle movie stars filter
   */
  toggleMovieStarsFilter(): void {
    this.showMovieStarsOnly.update(current => !current);
  }

  /**
   * Toggle favorites filter
   */
  toggleFavoritesFilter(): void {
    this.showFavoritesOnly.update(current => !current);
  }
}
