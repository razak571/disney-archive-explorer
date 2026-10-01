import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { StateService } from '../../services/state.service';
import { FavoritesService } from '../../services/favorites.service';

/**
 * HeaderComponent — Top navigation bar
 *
 * Contains: App title, search input (with RxJS debounce), filter toggles, favorites count
 *
 * SEARCH with RxJS:
 * - User types → debounceTime(300ms) → waits until user stops typing
 * - distinctUntilChanged() → skips if same value typed again
 * - Then updates the search filter in StateService
 */
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <header class="header">
      <div class="header-content">
        <!-- Logo & Title -->
        <div class="header-brand">
          <span class="header-icon">🏰</span>
          <div>
            <h1 class="header-title">Disney Archive Explorer</h1>
            <p class="header-subtitle">
              Showing {{ stateService.filteredCount() }} of {{ stateService.totalCount() }} characters
            </p>
          </div>
        </div>

        <!-- Search Bar with RxJS -->
        <div class="search-container">
          <span class="search-icon">🔍</span>
          <input
            type="text"
            class="search-input"
            placeholder="Search characters..."
            [formControl]="searchControl"
          />
          @if (searchControl.value) {
            <button class="search-clear" (click)="clearSearch()">✕</button>
          }
        </div>

        <!-- Filter Controls -->
        <div class="header-controls">
          <!-- Movie Stars Toggle -->
          <button
            class="filter-btn"
            [class.active]="stateService.showMovieStarsOnly()"
            (click)="stateService.toggleMovieStarsFilter()"
          >
            🎬 Movie Stars
          </button>

          <!-- Favorites Toggle -->
          <button
            class="filter-btn favorites-btn"
            [class.active]="stateService.showFavoritesOnly()"
            (click)="stateService.toggleFavoritesFilter()"
          >
            ❤️ Favorites
            @if (favoritesService.count() > 0) {
              <span class="badge">{{ favoritesService.count() }}</span>
            }
          </button>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .header {
      background: var(--color-primary);
      color: white;
      padding: var(--spacing-md) 0;
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
    }

    .header-content {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 var(--spacing-md);
      display: flex;
      align-items: center;
      gap: var(--spacing-lg);
      flex-wrap: wrap;
    }

    .header-brand {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
    }

    .header-icon {
      font-size: 2rem;
    }

    .header-title {
      font-size: 1.25rem;
      font-weight: 700;
      letter-spacing: -0.02em;
    }

    .header-subtitle {
      font-size: 0.75rem;
      opacity: 0.7;
      font-weight: 400;
    }

    .search-container {
      flex: 1;
      min-width: 200px;
      max-width: 400px;
      position: relative;
    }

    .search-icon {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 0.875rem;
      opacity: 0.6;
    }

    .search-input {
      width: 100%;
      padding: 0.625rem 2.25rem;
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: var(--radius-full);
      background: rgba(255, 255, 255, 0.1);
      color: white;
      font-size: 0.875rem;
      font-family: inherit;
      outline: none;
      transition: all var(--transition-normal);

      &::placeholder {
        color: rgba(255, 255, 255, 0.5);
      }

      &:focus {
        background: rgba(255, 255, 255, 0.15);
        border-color: rgba(255, 255, 255, 0.4);
      }
    }

    .search-clear {
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      color: rgba(255, 255, 255, 0.6);
      font-size: 0.875rem;
      padding: 4px;

      &:hover {
        color: white;
      }
    }

    .header-controls {
      display: flex;
      gap: var(--spacing-sm);
    }

    .filter-btn {
      padding: 0.5rem 1rem;
      border-radius: var(--radius-full);
      font-size: 0.8rem;
      font-weight: 500;
      color: rgba(255, 255, 255, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.2);
      transition: all var(--transition-normal);
      white-space: nowrap;

      &:hover {
        background: rgba(255, 255, 255, 0.1);
        color: white;
      }

      &.active {
        background: var(--color-accent);
        border-color: var(--color-accent);
        color: white;
      }
    }

    .badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: var(--color-gold);
      color: var(--color-primary);
      font-size: 0.7rem;
      font-weight: 700;
      min-width: 18px;
      height: 18px;
      border-radius: var(--radius-full);
      margin-left: 4px;
      padding: 0 4px;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .header-content {
        flex-direction: column;
        align-items: stretch;
        gap: var(--spacing-sm);
      }

      .header-brand {
        justify-content: center;
      }

      .search-container {
        max-width: 100%;
      }

      .header-controls {
        justify-content: center;
      }
    }
  `]
})
export class HeaderComponent implements OnInit, OnDestroy {
  /**
   * FormControl = a reactive form input (Angular's way)
   * We subscribe to its valueChanges observable to get RxJS superpowers
   */
  searchControl = new FormControl('');

  /** Used to clean up subscriptions when component is destroyed (prevents memory leaks) */
  private destroy$ = new Subject<void>();

  constructor(
    public stateService: StateService,
    public favoritesService: FavoritesService
  ) {}

  ngOnInit(): void {
    /**
     * RxJS Search Pipeline:
     *
     * 1. searchControl.valueChanges → emits on input changes
     * 2. debounceTime(300) → waits 300ms after last keystroke
     * 3. distinctUntilChanged() → ignores redundant identical values
     * 4. takeUntil(destroy$) → auto-unsubscribes on component teardown
     */
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(term => {
        this.stateService.setSearchTerm(term || '');
      });
  }

  clearSearch(): void {
    this.searchControl.setValue('');
    this.stateService.setSearchTerm('');
  }

  /**
   * Cleans up active subscriptions on component destruction to prevent memory leaks
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
