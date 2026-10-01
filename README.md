# Disney Archive Explorer

A high-performance Angular dashboard for browsing and filtering 10,000+ Disney characters from the public Disney API. Built with Angular 18, Signals, RxJS, and CSS Grid.

**Live Demo:** https://disney-archive-explorer.vercel.app/

## Features

- Real-time character search with RxJS debounce optimization
- "Movie Stars" filter to show only characters appearing in films
- Favorites system with localStorage persistence
- Character detail pages with full metadata (films, TV shows, games, allies, enemies)
- Progressive rendering for smooth performance with large datasets
- Responsive CSS Grid layout (mobile, tablet, desktop)
- Graceful image fallback handling for broken URLs

## Tech Stack

- Angular 18 (standalone components)
- TypeScript
- Angular Signals for state management (`signal`, `computed`, `effect`)
- RxJS for search stream optimization (`debounceTime`, `distinctUntilChanged`)
- SCSS with CSS custom properties
- CSS Grid and Flexbox for responsive layout
- Angular Router for navigation
- Angular CDK

## Project Structure

```
src/app/
├── models/
│   └── character.model.ts            # data interfaces
├── services/
│   ├── disney.service.ts             # API communication + caching (shareReplay)
│   ├── favorites.service.ts          # favorites management with localStorage
│   └── state.service.ts              # central state with Signals
├── components/
│   ├── header/                       # search bar, filter toggles, nav
│   ├── character-card/               # individual character card
│   └── character-list/               # grid layout with progressive loading
├── pages/
│   ├── home/                         # main explorer view
│   └── character-detail/             # single character detail view
├── app.routes.ts                     # route definitions
├── app.config.ts                     # application providers
└── app.component.ts                  # root component
```

## Architecture Decisions

**Service layer separation** - Components never call APIs directly. All HTTP requests, caching, and data transformations are handled through dedicated services. If the API contract changes, only the service file needs an update.

**Signals over NgRx** - For a dataset that loads once and gets filtered client-side, Angular Signals provide clean, synchronous reactivity without the boilerplate overhead of a full store solution like NgRx. `computed()` handles derived state (filtered results) automatically.

**RxJS on the search input** - The search bar uses `debounceTime(300)` and `distinctUntilChanged()` to avoid filtering 10,000 items on every single keystroke. This reduces redundant filter operations significantly.

**Progressive rendering** - Rather than dumping 10,000 DOM nodes at once, the grid renders an initial batch of 60 characters and progressively loads more as the user scrolls. Combined with native `loading="lazy"` on images, this keeps the initial paint fast.

**`shareReplay(1)` for API caching** - The 10k character dataset is fetched once and cached in the RxJS stream. Navigating between the list view and detail view serves data from memory without additional network calls.

## Performance Notes

| Technique | What it does |
|-----------|-------------|
| `shareReplay(1)` | Caches the API response, prevents duplicate fetches |
| `debounceTime(300)` | Waits 300ms after last keystroke before filtering |
| Progressive rendering | Only ~60 DOM nodes initially, more loaded on scroll |
| `loading="lazy"` | Browser loads images only when they approach the viewport |
| `throttleTime(100)` | Limits scroll event processing to 10 times per second |
| `track` in `@for` | Helps Angular reuse existing DOM nodes during re-renders |

## Getting Started

Prerequisites: Node.js 18+ and npm 9+

```bash
# clone the repo
git clone https://github.com/razak571/disney-archive-explorer.git
cd disney-archive-explorer

# install dependencies
npm install

# start dev server
npx ng serve
```

Open `http://localhost:4200` in your browser.

### Production build

```bash
npx ng build --configuration production
```

Output goes to `dist/disney-archive-explorer/browser`.

## API

Uses the public [Disney API](https://disneyapi.dev/):

- Endpoint: `https://api.disneyapi.dev/character?pageSize=10000`
- No authentication required
- Returns character names, images, films, TV shows, video games, and more

## Responsive Breakpoints

- Below 768px: 2-column grid, stacked header layout
- 768px to 1199px: 3-4 column grid
- 1200px and above: 5-6 column grid
