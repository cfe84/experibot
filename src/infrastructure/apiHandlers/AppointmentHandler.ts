import { Application, Request, Response } from "express";
import { Appointment } from "../../domain/appointments/Appointment";
import { IAppointmentStore } from "../../domain/appointments/IAppointmentStore";
import { IServiceTypeStore } from "../../domain/appointments/IServiceTypeStore";
import { ServiceType as ServiceType } from "../../domain/appointments/ServiceType";

export interface GetAppointmentDto {
  date: Date,
  id: string,
  serviceType: string,
  serviceTypeId: string,
  title: string
}

export interface IAppointmentDependencies {
  appointmentStore: IAppointmentStore
  serviceTypeStore: IServiceTypeStore
}

export class AppointmentHandler {
  constructor(app: Application, private deps: IAppointmentDependencies) {
    app.get("/api/appointments", this.getAppointments.bind(this))
    app.post("/api/appointments", this.postAppointment.bind(this))
    app.put("/api/appointments/*", this.postAppointment.bind(this))
    app.get("/api/serviceTypes", this.getServiceTypes.bind(this))
  }

  private async getAppointments(req: Request, res: Response) {
    const appointments = await this.deps.appointmentStore.getAppointmentsAsync()
    const serviceTypes = await this.deps.serviceTypeStore.getServiceTypesAsync()
    const appointmentsDto: GetAppointmentDto[] = appointments.map(apt => ({
      date: apt.date,
      title: apt.title,
      id: apt.id,
      serviceType: serviceTypes.find(type => type.id === apt.serviceTypeId)?.name || "Unknown",
      serviceTypeId: apt.serviceTypeId
    }))
    res.write(JSON.stringify(appointmentsDto))
    res.end()
  }

  private async postAppointment(req: Request, res: Response) {
    const appointment = req.body as Appointment
    await this.deps.appointmentStore.saveAppointmentAsync(appointment)
    res.end()
  }

  private async getServiceTypes(req: Request, res: Response) {
    const serviceTypes: ServiceType[] = await this.deps.serviceTypeStore.getServiceTypesAsync()
    res.write(JSON.stringify(serviceTypes))
    res.end()
  }
}