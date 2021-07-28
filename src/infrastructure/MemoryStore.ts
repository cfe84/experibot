import { Appointment } from "../domain/appointments/Appointment";
import { IAppointmentStore } from "../domain/appointments/IAppointmentStore";
import { v4 as uuid } from "uuid"
import { IServiceTypeStore } from "../domain/appointments/IServiceTypeStore";
import { ServiceType } from "../domain/appointments/ServiceType";

interface IDictionary<T> {
  [key: string]: T
}

export class MemoryStore implements IAppointmentStore, IServiceTypeStore {
  constructor() {
    this.generateGarbageServiceTypes().forEach(svc => this.serviceTypes[svc.id] = svc)
    this.generateGarbageAppointments(50).forEach(apt => this.appointments[apt.id] = apt)
  }

  serviceTypes: IDictionary<ServiceType> = {}
  async getServiceTypesAsync(): Promise<ServiceType[]> {
    return Object.values(this.serviceTypes)
  }
  async getServiceTypeAsync(serviceTypeId: string): Promise<ServiceType> {
    return this.serviceTypes[serviceTypeId]
  }
  async saveServiceTypeAsync(serviceType: ServiceType): Promise<void> {
    this.serviceTypes[serviceType.id] = serviceType
  }
  appointments: IDictionary<Appointment> = {}

  async getAppointmentsAsync(): Promise<Appointment[]> {
    return Object.values(this.appointments)
  }
  async saveAppointmentAsync(appointment: Appointment): Promise<void> {
    if (!appointment.id) {
      appointment.id = uuid()
    }
    this.appointments[appointment.id] = appointment
  }


  private generateGarbageAppointments(count: number): Appointment[] {
    const services = Object.values(this.serviceTypes)
    const providers = ["Alice", "Bob", "Cathy", "Donald", "Erin", "Fatima", "Gunjan", "Horace", "Iris"]
    const res: Appointment[] = []
    for (let i = 0; i < count; i++) {
      const date = new Date()
      date.setDate(date.getDate() + Math.floor(Math.random() * count / 5))
      date.setHours(8 + Math.floor(Math.random() * 13), Math.random() > .5 ? 30 : 0, 0, 0)
      const id = uuid()
      const serviceType = services[Math.floor(Math.random() * services.length)]
      const provider = providers[Math.floor(Math.random() * providers.length)]
      const title = `${serviceType.name} with ${provider}`
      res.push({
        date,
        id,
        serviceTypeId: serviceType.id,
        title
      })
    }
    return res
  }

  private generateGarbageServiceTypes(): ServiceType[] {
    const sportTypes = ["yoga", "stretch", "spin", "step"]
    const levels = ["Trial", "Beginner", "Intermediate", "Advanced"]
    const res: ServiceType[] = sportTypes
      .map(sport => {
        const sportFactor = Math.random() * 10
        return levels.map((level, i) => (
          {
            id: uuid(),
            name: `${level} ${sport} class`,
            price: Math.ceil(i * 20 * sportFactor)
          }
        ))
      })
      .reduce((agg, cur) => agg.concat(cur), [])
    return res
  }
}