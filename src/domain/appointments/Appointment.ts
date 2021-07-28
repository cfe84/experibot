import { ServiceTypeId as ServiceTypeId } from "./ServiceTypeId";

export interface Appointment {
  id: string,
  date: Date,
  title: string,
  serviceTypeId: ServiceTypeId
}