import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  {
    path: 'blog',
    loadComponent: () =>
      import('./components/blog/blog-list.component').then((m) => m.BlogListComponent),
  },
  {
    path: 'blog/:slug',
    loadComponent: () =>
      import('./components/blog/blog-post.component').then((m) => m.BlogPostComponent),
  },
  { path: '**', redirectTo: '' },
];
