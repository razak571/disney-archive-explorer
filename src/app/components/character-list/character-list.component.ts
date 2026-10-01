import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CharacterCardComponent } from '../character-card/character-card.component';
import { StateService } from '../../services/state.service';
import { DisneyCharacter } from '../../models/character.model';
import { Subject, fromEvent, takeUntil, throttleTime } from 'rxjs';

/**
 * CharacterListComponent — The main grid that displays characters
 *
 * Performance Strategy: Progressive Rendering
 * Instead of CDK virtual scroll (which doesn't play well with CSS Grid),
 * we use a progressive loading approach:
 * - Initially render first batch of cards (e.g., 60)
 * - As user scrolls near the bottom, render more
 * - Images use lazy loading (loading="lazy") so only visible ones load
 *
 * Combined with lazy image loading, this gives smooth performance with 10k items
 * while maintaining the CSS Grid layout the assignment requires.
 */
@Component({
  selector: 'app-character-list',
  standalone: true,
  imports: [CommonModule, CharacterCardComponent],
  template: `
    <!-- Loading State -->
    @if (stateService.isLoading()) {
      <div class="loading-container">
        <div class="loading-spinner"></div>
        <p class="loading-text">Loading Disney characters...</p>
      </div>
    }

    <!-- Error State -->
    @if (stateService.error()) {
      <div class="error-container">
        <span class="error-icon">⚠️</span>
        <p>{{ stateService.error() }}</p>
      </div>
    }

    <!-- Empty State -->
    @if (!stateService.isLoading() && !stateService.error() && stateService.filteredCount() === 0) {
      <div class="empty-container">
        <span class="empty-icon">🔍</span>
        <p class="empty-text">No characters found</p>
        <p class="empty-hint">Try adjusting your search or filters</p>
      </div>
    }

    <!-- Character Grid -->
    @if (!stateService.isLoading() && stateService.filteredCount() > 0) {
      <div class="grid-wrapper" #scrollContainer (scroll)="onScroll()">
        <div class="character-grid">
          @for (character of visibleCharacters; track character._id) {
            <app-character-card [character]="character" />
          }
        </div>

        <!-- Load More Indicator -->
        @if (visibleCharacters.length < stateService.filteredCount()) {
          <div class="load-more" #loadMoreTrigger>
            <div class="loading-spinner small"></div>
            <p>Loading more characters...</p>
          </div>
        }

        <!-- Scroll to Top Button -->
        @if (showScrollTop) {
          <button class="scroll-top-btn" (click)="scrollToTop()">↑</button>
        }
      </div>
    }
  `,
  styles: [`
    .grid-wrapper {
      height: calc(100vh - 80px);
      overflow-y: auto;
      scroll-behavior: smooth;
    }

    /* CSS Grid — responsive card layout (assignment requirement) */
    .character-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: var(--spacing-md);
      padding: var(--spacing-lg);
      max-width: 1400px;
      margin: 0 auto;
    }

    /* Responsive grid adjustments */
    @media (min-width: 768px) {
      .character-grid {
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: var(--spacing-lg);
        padding: var(--spacing-xl);
      }
    }

    @media (min-width: 1200px) {
      .character-grid {
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      }
    }

    /* Loading State */
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 60vh;
      gap: var(--spacing-lg);
    }

    .loading-spinner {
      width: 48px;
      height: 48px;
      border: 4px solid var(--color-border);
      border-top-color: var(--color-accent);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;

      &.small {
        width: 24px;
        height: 24px;
        border-width: 3px;
      }
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .loading-text {
      color: var(--color-text-secondary);
      font-size: 1rem;
    }

    /* Error State */
    .error-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 60vh;
      gap: var(--spacing-md);
      color: var(--color-accent);
    }

    .error-icon {
      font-size: 3rem;
    }

    /* Empty State */
    .empty-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 60vh;
      gap: var(--spacing-sm);
    }

    .empty-icon {
      font-size: 3rem;
    }

    .empty-text {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--color-text);
    }

    .empty-hint {
      color: var(--color-text-secondary);
      font-size: 0.875rem;
    }

    /* Load More */
    .load-more {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-sm);
      padding: var(--spacing-xl);
      color: var(--color-text-secondary);
      font-size: 0.875rem;
    }

    /* Scroll to Top */
    .scroll-top-btn {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      width: 44px;
      height: 44px;
      border-radius: var(--radius-full);
      background: var(--color-primary);
      color: white;
      font-size: 1.25rem;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      transition: all var(--transition-normal);
      z-index: 50;

      &:hover {
        transform: translateY(-2px);
        background: var(--color-accent);
      }
    }
  `]
})
export class CharacterListComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  /** How many characters to show at a time */
  private readonly BATCH_SIZE = 60;

  /** Currently visible characters (progressive rendering) */
  visibleCharacters: DisneyCharacter[] = [];

  /** Show/hide scroll-to-top button */
  showScrollTop = false;

  /** Current number of items loaded */
  private currentLimit = this.BATCH_SIZE;

  private destroy$ = new Subject<void>();

  constructor(public stateService: StateService) {
    /**
     * Watches filteredCharacters signal and resets visible items
     * to the initial batch whenever search/filters change
     */
    effect(() => {
      const filtered = this.stateService.filteredCharacters();
      this.currentLimit = this.BATCH_SIZE;
      this.visibleCharacters = filtered.slice(0, this.currentLimit);
    });
  }

  ngOnInit(): void {
    // Filter reactivity is handled by effect() in constructor
  }

  ngAfterViewInit(): void {
    // Scroll events are handled via (scroll) binding in the template
  }

  /**
   * Called on scroll — check if user is near bottom to load more
   */
  onScroll(): void {
    const el = this.scrollContainer.nativeElement;
    const scrollPosition = el.scrollTop + el.clientHeight;
    const scrollHeight = el.scrollHeight;

    // Show scroll-to-top button after scrolling down
    this.showScrollTop = el.scrollTop > 500;

    // Load more when within 500px of the bottom
    if (scrollHeight - scrollPosition < 500) {
      this.loadMore();
    }
  }

  /**
   * Load the next batch of characters
   */
  private loadMore(): void {
    const filtered = this.stateService.filteredCharacters();
    if (this.currentLimit < filtered.length) {
      this.currentLimit += this.BATCH_SIZE;
      this.visibleCharacters = filtered.slice(0, this.currentLimit);
    }
  }

  /**
   * Update visible characters when filters change
   * We use Angular's change detection to handle this
   */
  updateVisibleCharacters(): void {
    const filtered = this.stateService.filteredCharacters();
    this.currentLimit = this.BATCH_SIZE;
    this.visibleCharacters = filtered.slice(0, this.currentLimit);
  }

  scrollToTop(): void {
    if (this.scrollContainer) {
      this.scrollContainer.nativeElement.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
