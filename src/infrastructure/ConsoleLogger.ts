import { ILogger } from "../domain/ILogger";

export enum LogLevel {
  Debug = 0,
  Log = 2,
  Warning = 3,
  Error = 4,
  Critical = 5,
}

export class ConsoleLogger implements ILogger {
  constructor(private level: LogLevel) {
    this.debug("Loglevel set as debug");
  }
  debug(message: any, ...optionalParams: any[]) {
    if (this.level <= LogLevel.Debug) {
      console.log(message, ...optionalParams);
    }
  }
  log(message: any, ...optionalParams: any[]) {
    if (this.level <= LogLevel.Log) {
      console.log(message, ...optionalParams);
    }
  }
  warn(message: any, ...optionalParams: any[]) {
    if (this.level <= LogLevel.Warning) {
      console.warn(message, ...optionalParams);
    }
  }

  error(message: any, ...optionalParams: any[]) {
    if (this.level <= LogLevel.Error) {
      console.error(message, ...optionalParams);
    }
  }
}
