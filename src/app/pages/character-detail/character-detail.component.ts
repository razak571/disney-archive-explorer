import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { DisneyCharacter } from '../../models/character.model';
import { DisneyService } from '../../services/disney.service';
import { FavoritesService } from '../../services/favorites.service';

/**
 * CharacterDetailComponent — Full detail view for a single character
 *
 * Accessed via route: /character/:id
 * Reads character ID parameter and renders categorized details.
 */
@Component({
  selector: 'app-character-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (character()) {
      <div class="detail-page">
        <!-- Back Button -->
        <button class="back-btn" (click)="goBack()">
          ← Back to Explorer
        </button>

        <div class="detail-content">
          <!-- Character Image -->
          <div class="detail-image-container">
            <img
              [src]="character()!.imageUrl"
              [alt]="character()!.name"
              class="detail-image"
              (error)="onImageError($event)"
            />
            <button
              class="detail-favorite-btn"
              [class.is-favorite]="favoritesService.isFavorite(character()!._id)"
              (click)="favoritesService.toggleFavorite(character()!._id)"
            >
              {{ favoritesService.isFavorite(character()!._id) ? '❤️ Remove from Favorites' : '🤍 Add to Favorites' }}
            </button>
          </div>

          <!-- Character Info -->
          <div class="detail-info">
            <h1 class="detail-name">{{ character()!.name }}</h1>

            <!-- Films -->
            @if (character()!.films.length > 0) {
              <div class="detail-section">
                <h2 class="section-title">🎬 Films</h2>
                <div class="tag-list">
                  @for (film of character()!.films; track film) {
                    <span class="tag film-tag">{{ film }}</span>
                  }
                </div>
              </div>
            }

            <!-- TV Shows -->
            @if (character()!.tvShows.length > 0) {
              <div class="detail-section">
                <h2 class="section-title">📺 TV Shows</h2>
                <div class="tag-list">
                  @for (show of character()!.tvShows; track show) {
                    <span class="tag tv-tag">{{ show }}</span>
                  }
                </div>
              </div>
            }

            <!-- Video Games -->
            @if (character()!.videoGames.length > 0) {
              <div class="detail-section">
                <h2 class="section-title">🎮 Video Games</h2>
                <div class="tag-list">
                  @for (game of character()!.videoGames; track game) {
                    <span class="tag game-tag">{{ game }}</span>
                  }
                </div>
              </div>
            }

            <!-- Short Films -->
            @if (character()!.shortFilms.length > 0) {
              <div class="detail-section">
                <h2 class="section-title">🎞️ Short Films</h2>
                <div class="tag-list">
                  @for (film of character()!.shortFilms; track film) {
                    <span class="tag">{{ film }}</span>
                  }
                </div>
              </div>
            }

            <!-- Park Attractions -->
            @if (character()!.parkAttractions.length > 0) {
              <div class="detail-section">
                <h2 class="section-title">🎢 Park Attractions</h2>
                <div class="tag-list">
                  @for (attraction of character()!.parkAttractions; track attraction) {
                    <span class="tag">{{ attraction }}</span>
                  }
                </div>
              </div>
            }

            <!-- Allies -->
            @if (character()!.allies.length > 0) {
              <div class="detail-section">
                <h2 class="section-title">🤝 Allies</h2>
                <div class="tag-list">
                  @for (ally of character()!.allies; track ally) {
                    <span class="tag ally-tag">{{ ally }}</span>
                  }
                </div>
              </div>
            }

            <!-- Enemies -->
            @if (character()!.enemies.length > 0) {
              <div class="detail-section">
                <h2 class="section-title">⚔️ Enemies</h2>
                <div class="tag-list">
                  @for (enemy of character()!.enemies; track enemy) {
                    <span class="tag enemy-tag">{{ enemy }}</span>
                  }
                </div>
              </div>
            }

            <!-- No details available -->
            @if (character()!.films.length === 0 && character()!.tvShows.length === 0 &&
                 character()!.videoGames.length === 0 && character()!.shortFilms.length === 0) {
              <div class="detail-section">
                <p class="no-details">No additional details available for this character.</p>
              </div>
            }
          </div>
        </div>
      </div>
    } @else {
      <div class="loading-container">
        <div class="loading-spinner"></div>
        <p>Loading character...</p>
      </div>
    }
  `,
  styles: [`
    .detail-page {
      max-width: 1000px;
      margin: 0 auto;
      padding: var(--spacing-lg);
    }

    .back-btn {
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-xs);
      padding: var(--spacing-sm) var(--spacing-md);
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--color-text);
      margin-bottom: var(--spacing-lg);
      transition: all var(--transition-fast);

      &:hover {
        background: var(--color-primary);
        color: white;
        border-color: var(--color-primary);
      }
    }

    .detail-content {
      display: grid;
      grid-template-columns: 1fr;
      gap: var(--spacing-xl);
      background: var(--color-surface);
      border-radius: var(--radius-xl);
      overflow: hidden;
      border: 1px solid var(--color-border);
      box-shadow: 0 4px 16px var(--color-shadow);
    }

    @media (min-width: 768px) {
      .detail-content {
        grid-template-columns: 350px 1fr;
      }
    }

    .detail-image-container {
      position: relative;
    }

    .detail-image {
      width: 100%;
      height: 100%;
      min-height: 300px;
      max-height: 500px;
      object-fit: cover;
    }

    @media (min-width: 768px) {
      .detail-image {
        max-height: none;
      }
    }

    .detail-favorite-btn {
      position: absolute;
      bottom: var(--spacing-md);
      left: 50%;
      transform: translateX(-50%);
      padding: var(--spacing-sm) var(--spacing-lg);
      border-radius: var(--radius-full);
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(8px);
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--color-text);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      transition: all var(--transition-normal);
      white-space: nowrap;

      &:hover {
        transform: translateX(-50%) scale(1.05);
      }

      &.is-favorite {
        background: var(--color-accent);
        color: white;
      }
    }

    .detail-info {
      padding: var(--spacing-xl);
    }

    .detail-name {
      font-size: 2rem;
      font-weight: 700;
      color: var(--color-primary);
      margin-bottom: var(--spacing-lg);
      letter-spacing: -0.02em;
    }

    .detail-section {
      margin-bottom: var(--spacing-lg);
    }

    .section-title {
      font-size: 1rem;
      font-weight: 600;
      color: var(--color-text);
      margin-bottom: var(--spacing-sm);
    }

    .tag-list {
      display: flex;
      flex-wrap: wrap;
      gap: var(--spacing-xs);
    }

    .tag {
      padding: 0.375rem 0.75rem;
      border-radius: var(--radius-full);
      font-size: 0.8rem;
      font-weight: 500;
      background: #f3f4f6;
      color: var(--color-text-secondary);
    }

    .film-tag { background: #dbeafe; color: #1e40af; }
    .tv-tag { background: #fce7f3; color: #9d174d; }
    .game-tag { background: #d1fae5; color: #065f46; }
    .ally-tag { background: #e0e7ff; color: #3730a3; }
    .enemy-tag { background: #fee2e2; color: #991b1b; }

    .no-details {
      color: var(--color-text-secondary);
      font-style: italic;
    }

    /* Loading */
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 80vh;
      gap: var(--spacing-lg);
      color: var(--color-text-secondary);
    }

    .loading-spinner {
      width: 48px;
      height: 48px;
      border: 4px solid var(--color-border);
      border-top-color: var(--color-accent);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class CharacterDetailComponent implements OnInit {
  character = signal<DisneyCharacter | null>(null);

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private disneyService: DisneyService,
    public favoritesService: FavoritesService
  ) {}

  /**
   * Reads the :id parameter from the route and retrieves character data
   */
  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.disneyService.getCharacterById(id).subscribe(char => {
        if (char) {
          this.character.set(char);
        }
      });
    }
  }

  goBack(): void {
    this.location.back();
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'data:image/svg+xml,' + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="350" height="400" viewBox="0 0 350 400">
        <rect width="350" height="400" fill="#f3f4f6"/>
        <text x="175" y="180" text-anchor="middle" font-family="sans-serif" font-size="64">🏰</text>
        <text x="175" y="230" text-anchor="middle" font-family="sans-serif" font-size="16" fill="#9ca3af">No Image Available</text>
      </svg>
    `);
  }
}
