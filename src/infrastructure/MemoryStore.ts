import { IThingStore, Thing } from "../domain";

export class MemoryStore implements IThingStore {
  getThingsAsync(): Promise<Thing[]> {
    return Promise.resolve(Object.keys(this.thingStore).map(key => this.thingStore[key]));
  }

  private thingStore: { [id: string]: Thing } = {
  }

  getThingAsync(id: string): Promise<Thing> {
    return Promise.resolve(this.thingStore[id])
  }
  saveThingAsync(thing: Thing): Promise<void> {
    this.thingStore[thing.id] = thing
    return Promise.resolve()
  }
}