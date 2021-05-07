import { Thing } from ".";

export interface IThingStore {
  getThingAsync(thingId: string): Promise<Thing>
  getThingsAsync(): Promise<Thing[]>
  saveThingAsync(thing: Thing): Promise<void>
}