import { Application, Request, Response } from "express";
import { ServiceType as ServiceType } from "../../domain/appointments/ServiceType";

export interface GetAppointmentDto {
  date: Date,
  id: string,
  serviceType: string,
  serviceTypeId: string,
  title: string
}

export class AppointmentHandler {
  constructor(app: Application) {
    app.get("/api/appointments", this.getAppointments.bind(this))
    app.get("/api/serviceTypes", this.getServiceTypes.bind(this))
  }

  private getAppointments(req: Request, res: Response) {
    const appointments: GetAppointmentDto[] = [
      {
        date: new Date(),
        id: "dfsdfs",
        serviceType: "dfsdfs",
        serviceTypeId: "123",
        title: "sdfsdf"
      }
    ]
    res.write(JSON.stringify(appointments))
    res.end()
  }

  private getServiceTypes(req: Request, res: Response) {
    const serviceTypes: ServiceType[] = []
    res.write(JSON.stringify(serviceTypes))
    res.end()
  }
}