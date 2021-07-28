import { ServiceType } from "./ServiceType";
import { ServiceTypeId } from "./ServiceTypeId";

export interface IServiceTypeStore {
  getServiceTypesAsync(): Promise<ServiceType[]>
  getServiceTypeAsync(serviceTypeId: ServiceTypeId): Promise<ServiceType>
  saveServiceTypeAsync(serviceType: ServiceType): Promise<void>
}