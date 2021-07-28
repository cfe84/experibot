import { Product } from "./Product";

export interface IProductStore {
  getProductsAsync(): Promise<Product[]>
  saveProductAsync(product: Product): Promise<void>
}