import { Component } from '@angular/core';
import { HeaderComponent } from '../../components/header/header.component';
import { CharacterListComponent } from '../../components/character-list/character-list.component';

/**
 * HomePage — The main landing page
 *
 * Route-level component that composes Header and CharacterList
 */
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HeaderComponent, CharacterListComponent],
  template: `
    <app-header />
    <main>
      <app-character-list />
    </main>
  `,
  styles: [`
    main {
      min-height: calc(100vh - 80px);
    }
  `]
})
export class HomeComponent {}
