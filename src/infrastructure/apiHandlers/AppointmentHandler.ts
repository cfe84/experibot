import { Application, Request, Response } from "express";
import { Product } from "../../domain/appointments/Product";

export class AppointmentHandler {
  constructor(app: Application) {
    app.get("/api/appointments", this.getProducts.bind(this))
  }

  private getProducts(req: Request, res: Response) {
    const products: Product[] = []
    res.write(JSON.stringify(products))
    res.end()
  }
}