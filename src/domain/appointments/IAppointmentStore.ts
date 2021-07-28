import { Appointment } from "./Appointment";

export interface IAppointmentStore {
  getAppointmentsAsync(): Promise<Appointment[]>
  saveAppointmentAsync(appointment: Appointment): Promise<void>
}