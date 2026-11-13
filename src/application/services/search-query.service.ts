import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SearchQueryService {
  query = signal('');
  activeTag = signal('');
  openFlow = signal(false);
  fotoCliente = signal<string | null>(null);
  fotosCliente = signal<string[]>([]);
  set(q: string, tag = ''): void {
    this.query.set(q);
    this.activeTag.set(tag);
  }
  requestFlow(): void { this.openFlow.set(true); }
}
