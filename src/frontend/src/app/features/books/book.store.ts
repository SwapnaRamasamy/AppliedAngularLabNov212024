import { withDevtools } from '@angular-architects/ngrx-toolkit';
import { patchState, signalStore, type, withComputed, withHooks, withMethods } from '@ngrx/signals';
import { setEntities, withEntities } from '@ngrx/signals/entities';
import { BookEntity } from './books.component';
import { BookDataService } from './services/book-data.service';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { computed, inject } from '@angular/core';
import { pipe, switchMap, tap } from 'rxjs';

export const BookStore = signalStore(
  withDevtools('book-store'),
  withEntities({ collection: '_books', entity: type<BookEntity>() }),
  withMethods((store) => {
    // injection context
    const service = inject(BookDataService);
    return {
      load: rxMethod<void>(
        pipe(
          switchMap(() =>
            service
              .getBooks()
              .pipe(
                tap((d) =>
                  patchState(store, setEntities(d, { collection: '_books' })),
                ),
              ),
          ),
        ),
      ),
    };
  }),
  withComputed((store) => {
    return {
      entities: computed(() => {
        const serverBooks = store._booksEntities();
       
        return [...serverBooks];
      }),
      totalBooks: computed(() => store._booksEntities().length),
      earliestPublishedBook: computed(() => store._booksEntities().sort((a,b)=> (a.year - b.year)).at(0)),
      recentPublishedBook: computed(() => store._booksEntities().sort((a,b)=> (b.year - a.year)).at(0)),
      averageNoOfPages: computed(() => {
        return store._booksEntities().map(b => b.pages).reduce((a,b) => a+b) / store._booksEntities().length ;
      }),
    };
  }),
  withHooks({
    onInit(store) {
      store.load();
    },
  }),
);
