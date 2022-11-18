import { ILogger } from "../domain/ILogger";

export enum LogLevel {
  Verbose = 0,
  Debug = 1,
  Log = 2,
  Warning = 3,
  Error = 4,
  Critical = 5,
  Output = 6
}

export class ConsoleLogger implements ILogger {
  constructor(private level: LogLevel) {
    this.log(`Loglevel set as ${level}`);
  }
  output(message: any, ...optionalParams: any[]): void {
    if (this.level <= LogLevel.Output) {
      console.log(message, ...optionalParams);
    }
  }
  verbose(message: any, ...optionalParams: any[]) {
    if (this.level <= LogLevel.Debug) {
      console.log(message, ...optionalParams);
    }
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
