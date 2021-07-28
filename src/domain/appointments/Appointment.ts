import { ProductId } from "./ProductId";

export interface Appointment {
  id: string,
  date: Date,
  title: string,
  product: ProductId
}