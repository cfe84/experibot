export interface ILogger {
  verbose(message: any, ...optionalParams: any[]): void;
  debug(message: any, ...optionalParams: any[]): void;
  log(message: any, ...optionalParams: any[]): void;
  warn(message: any, ...optionalParams: any[]): void;
  error(message: any, ...optionalParams: any[]): void;
  /**
   * Expected output, required for the function. Highest precedence.
   * 
   * @param message Message to output
   * @param optionalParams 
   */
  output(message: any, ...optionalParams: any[]): void;
}
