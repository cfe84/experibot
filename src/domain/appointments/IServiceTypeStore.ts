import { ServiceType } from "./ServiceType";

export interface IServiceTypeStore {
  getServiceTypesAsync(): Promise<ServiceType[]>
  saveServiceTypeAsync(serviceType: ServiceType): Promise<void>
}