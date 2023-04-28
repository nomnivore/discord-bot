/* eslint-disable no-console */
import { Chalk } from "chalk";

export class Logger {
  private readonly chalk = new Chalk();

  private readonly logLevels = [
    { label: "debug", color: this.chalk.gray },
    { label: "info", color: this.chalk.blue },
    { label: "warn", color: this.chalk.yellow },
    { label: "error", color: this.chalk.red },
  ];
  public readonly logLevel: number;

  constructor(logLevel = 1) {
    this.logLevel = logLevel;
  }

  private logFactory(logLevel: number) {
    return (...args: unknown[]): void => {
      if (logLevel >= this.logLevel) {
        const level = this.logLevels.at(logLevel);
        if (level !== undefined) {
          console.log(
            level.color(`[${level.label.toUpperCase()}]`.padEnd(7)),
            ...args
          );
        }
      }
    };
  }

  public debug = this.logFactory(0);
  public info = this.logFactory(1);
  public warn = this.logFactory(2);
  public error = this.logFactory(3);
}
