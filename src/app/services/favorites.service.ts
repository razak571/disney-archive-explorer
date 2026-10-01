import { Injectable, signal, computed } from '@angular/core';

/**
 * FavoritesService — Manages favorite characters with localStorage persistence
 *
 * WHY a separate service?
 * - Separation of concerns: favorites logic is independent of API logic
 * - Persistence: localStorage survives page refreshes and browser restarts
 * - Reactive: Uses Angular Signals so UI auto-updates when favorites change
 */
@Injectable({
  providedIn: 'root'
})
export class FavoritesService {

  private readonly STORAGE_KEY = 'disney_favorites';

  /** Reactive signal holding the Set of favorite character IDs */
  private favoriteIds = signal<Set<number>>(this.loadFromStorage());

  /** Computed: number of favorites (for badge display) */
  readonly count = computed(() => this.favoriteIds().size);

  /**
   * Check if a character is favorited
   */
  isFavorite(id: number): boolean {
    return this.favoriteIds().has(id);
  }

  /**
   * Toggle favorite status — add if not present, remove if present
   */
  toggleFavorite(id: number): void {
    const currentFavorites = new Set(this.favoriteIds());

    if (currentFavorites.has(id)) {
      currentFavorites.delete(id);
    } else {
      currentFavorites.add(id);
    }

    this.favoriteIds.set(currentFavorites);
    this.saveToStorage(currentFavorites);
  }

  /**
   * Get all favorite IDs as an array
   */
  getFavoriteIds(): number[] {
    return Array.from(this.favoriteIds());
  }

  /**
   * Check if a character is favorited (reactive — for use in templates)
   * Returns a computed signal so Angular can track changes
   */
  isFavoriteSignal(id: number) {
    return computed(() => this.favoriteIds().has(id));
  }

  /**
   * Load favorites from localStorage
   * Private — only used internally during initialization
   */
  private loadFromStorage(): Set<number> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return new Set<number>(Array.isArray(parsed) ? parsed : []);
      }
    } catch (error) {
      console.warn('Failed to load favorites from localStorage:', error);
    }
    return new Set<number>();
  }

  /**
   * Save favorites to localStorage
   * Private — called after every toggle operation
   */
  private saveToStorage(favorites: Set<number>): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(Array.from(favorites)));
    } catch (error) {
      console.warn('Failed to save favorites to localStorage:', error);
    }
  }
}
