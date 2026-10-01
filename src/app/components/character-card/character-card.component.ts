import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DisneyCharacter } from '../../models/character.model';
import { FavoritesService } from '../../services/favorites.service';

/**
 * CharacterCardComponent — Displays a single Disney character
 *
 * - @Input() receives a character object to render
 * - Clicking the card navigates to detail page
 * - Heart button toggles favorite state
 */
@Component({
  selector: 'app-character-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="card" [routerLink]="['/character', character._id]">
      <!-- Character Image -->
      <div class="card-image-container">
        <img
          [src]="character.imageUrl"
          [alt]="character.name"
          class="card-image"
          loading="lazy"
          (error)="onImageError($event)"
        />

        <!-- Favorite Button -->
        <button
          class="favorite-btn"
          [class.is-favorite]="favoritesService.isFavorite(character._id)"
          (click)="toggleFavorite($event)"
          [attr.aria-label]="favoritesService.isFavorite(character._id) ? 'Remove from favorites' : 'Add to favorites'"
        >
          {{ favoritesService.isFavorite(character._id) ? '❤️' : '🤍' }}
        </button>
      </div>

      <!-- Character Info -->
      <div class="card-body">
        <h3 class="card-name">{{ character.name }}</h3>
        <div class="card-meta">
          @if (character.films.length > 0) {
            <span class="meta-badge films">🎬 {{ character.films.length }} film{{ character.films.length > 1 ? 's' : '' }}</span>
          }
          @if (character.tvShows.length > 0) {
            <span class="meta-badge tv">📺 {{ character.tvShows.length }}</span>
          }
          @if (character.videoGames.length > 0) {
            <span class="meta-badge games">🎮 {{ character.videoGames.length }}</span>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card {
      background: var(--color-surface);
      border-radius: var(--radius-lg);
      overflow: hidden;
      cursor: pointer;
      transition: transform var(--transition-normal), box-shadow var(--transition-normal);
      border: 1px solid var(--color-border);
      height: 100%;
      display: flex;
      flex-direction: column;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 24px var(--color-shadow);
      }
    }

    .card-image-container {
      position: relative;
      width: 100%;
      padding-top: 120%; /* Aspect ratio */
      overflow: hidden;
      background: #f3f4f6;
    }

    .card-image {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform var(--transition-slow);
    }

    .card:hover .card-image {
      transform: scale(1.05);
    }

    .favorite-btn {
      position: absolute;
      top: 8px;
      right: 8px;
      width: 36px;
      height: 36px;
      border-radius: var(--radius-full);
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
      transition: all var(--transition-fast);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      z-index: 2;

      &:hover {
        transform: scale(1.15);
      }

      &.is-favorite {
        background: rgba(233, 69, 96, 0.15);
      }
    }

    .card-body {
      padding: var(--spacing-sm) var(--spacing-md) var(--spacing-md);
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xs);
    }

    .card-name {
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--color-text);
      line-height: 1.3;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .card-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
    }

    .meta-badge {
      font-size: 0.7rem;
      padding: 2px 6px;
      border-radius: var(--radius-sm);
      background: #f3f4f6;
      color: var(--color-text-secondary);
      white-space: nowrap;
    }
  `]
})
export class CharacterCardComponent {
  /**
   * Character data input passed from parent component
   */
  @Input({ required: true }) character!: DisneyCharacter;

  constructor(public favoritesService: FavoritesService) {}

  /**
   * Image error handler — shows placeholder when image URL is broken
   * This is the "fallback strategy" the assignment asks for
   */
  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'data:image/svg+xml,' + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="200" height="240" viewBox="0 0 200 240">
        <rect width="200" height="240" fill="#f3f4f6"/>
        <text x="100" y="110" text-anchor="middle" font-family="sans-serif" font-size="48">🏰</text>
        <text x="100" y="145" text-anchor="middle" font-family="sans-serif" font-size="12" fill="#9ca3af">No Image</text>
      </svg>
    `);
  }

  /**
   * Toggle favorite — stops event propagation so clicking the heart
   * doesn't also navigate to the detail page
   */
  toggleFavorite(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.favoritesService.toggleFavorite(this.character._id);
  }
}
