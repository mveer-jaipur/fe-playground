import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, finalize, Observable, tap, throwError, timer } from 'rxjs';
import { initialProduct, Product, ProductSearchResult } from '../products.component.model';
import { ProductHttpService } from './product-http.service';

@Injectable({ providedIn: 'root' })
export class ProductService {
  constructor(private productHttp: ProductHttpService) {}

  private readonly loading$$ = new BehaviorSubject<boolean>(false);
  private readonly products$$ = new BehaviorSubject<Product[]>([]);

  readonly products$: Observable<Product[]> = this.products$$;
  readonly loading$: Observable<boolean> = this.loading$$;

  getAll() {
    this.loading$$.next(true);
    return this.productHttp.getAll().pipe(
      tap((response) => this.products$$.next(response.products)),
      finalize(() => this.loading$$.next(false)),
    );
  }

  updateProduct(id: number, newProduct: Partial<Product>) {
    this.loading$$.next(true);

    return timer(750).pipe(
      tap(() => {
        const product = this.products$$.getValue().find((product) => product.id === id);

        if (!product) {
          return;
        }

        this._updateProduct(id, { ...product, ...newProduct });
      }),
      finalize(() => this.loading$$.next(false)),
    );
  }

  updateStock(id: number, newStock: number) {
    this.loading$$.next(true);

    return timer(750).pipe(
      tap(() => {
        const product = this.products$$.getValue().find((product) => product.id === id);

        if (!product) {
          return;
        }

        this._updateProduct(id, { ...product, stock: newStock });
      }),
      finalize(() => this.loading$$.next(false)),
    );
  }

  updatePrice(id: number, newPrice: number) {
    this.loading$$.next(true);

    return timer(750).pipe(
      tap(() => {
        const product = this.products$$.getValue().find((product) => product.id === id);

        if (!product) {
          return;
        }

        this._updateProduct(id, { ...product, price: newPrice });
      }),
      finalize(() => this.loading$$.next(false)),
    );
  }

  addProduct(product: Product) {
    this.loading$$.next(true);
    return this.productHttp.add(product)
    .pipe(
      tap((newProduct: Product) =>  this._addProduct({...initialProduct, ...product, ...newProduct})),
      catchError((err: HttpErrorResponse) => {
        throw new Error(err.message);
      }),
      finalize(() =>  this.loading$$.next(false))
    )
  }

  searchProduct(searchText: string) {
    this.loading$$.next(true);
    return this.productHttp.search(searchText).
      pipe(
        tap((response: ProductSearchResult) => this.products$$.next(response.products)),
        catchError((err: HttpErrorResponse) => {
          throw new Error(err.message);
        }),
        finalize(() =>  this.loading$$.next(false))
      )
  }

  private _updateProduct(id: number, product: Product) {
    const products = this.products$$.getValue();
    this.products$$.next([...products.filter((product) => product.id !== id), product]);
  }

  private _addProduct(product: Product) {
    const products = this.products$$.getValue();
    this.products$$.next([...products, product]);
  }
}
