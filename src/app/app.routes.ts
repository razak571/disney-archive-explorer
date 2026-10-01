import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { CharacterDetailComponent } from './pages/character-detail/character-detail.component';

/**
 * Route Configuration
 *
 * Maps URL paths to standalone page components.
 * Uses ':id' as the dynamic route parameter for character details.
 */
export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    title: 'Disney Archive Explorer'
  },
  {
    path: 'character/:id',
    component: CharacterDetailComponent,
    title: 'Character Details'
  },
  {
    // Wildcard — redirect unknown routes to home (security: no 404 info leak)
    path: '**',
    redirectTo: ''
  }
];
