import type { LogLevel } from './LogLevel';

/**
 * Logs messages on a specific level.
 *
 * @see getLoggerFor on how to instantiate loggers.
 */
export interface SimpleLogger<T = unknown> {
  /**
   * Log the given message at the given level.
   * If the internal level is higher than the given level, the message may be voided.
   *
   * @param level - The level to log at.
   * @param message - The message to log.
   * @param meta - Optional metadata to include in the log message.
   */
  log: (level: LogLevel, message: string, meta?: T) => SimpleLogger<T>;
}

/**
 * Logs messages, with convenience methods to log on a specific level.
 *
 * @see getLoggerFor on how to instantiate loggers.
 */
export interface Logger<T = unknown> extends SimpleLogger<T> {
  /**
   * Log the given message at the given level.
   * If the internal level is higher than the given level, the message may be voided.
   *
   * @param level - The level to log at.
   * @param message - The message to log.
   * @param meta - Optional metadata to include in the log message.
   */
  log: (level: LogLevel, message: string, meta?: T) => Logger<T>;

  /**
   * Log a message at the 'error' level.
   *
   * @param message - The message to log.
   * @param meta - Optional metadata to include in the log message.
   */
  error: (message: string, meta?: T) => Logger<T>;

  /**
   * Log a message at the 'warn' level.
   *
   * @param message - The message to log.
   * @param meta - Optional metadata to include in the log message.
   */
  warn: (message: string, meta?: T) => Logger<T>;

  /**
   * Log a message at the 'info' level.
   *
   * @param message - The message to log.
   * @param meta - Optional metadata to include in the log message.
   */
  info: (message: string, meta?: T) => Logger<T>;

  /**
   * Log a message at the 'verbose' level.
   *
   * @param message - The message to log.
   * @param meta - Optional metadata to include in the log message.
   */
  verbose: (message: string, meta?: T) => Logger<T>;

  /**
   * Log a message at the 'debug' level.
   *
   * @param message - The message to log.
   * @param meta - Optional metadata to include in the log message.
   */
  debug: (message: string) => Logger<T>;

  /**
   * Log a message at the 'silly' level.
   *
   * @param message - The message to log.
   * @param meta - Optional metadata to include in the log message.
   */
  silly: (message: string) => Logger<T>;
}

/**
 * Base class that implements all additional {@link BaseLogger} methods,
 * leaving only the implementation of {@link SimpleLogger}.
 */
export abstract class BaseLogger<T = unknown> implements Logger<T> {
  public abstract log(level: LogLevel, message: string, meta?: T): Logger<T>;

  public error(message: string, meta?: T): Logger<T> {
    return this.log('error', message, meta);
  }

  public warn(message: string, meta?: T): Logger<T> {
    return this.log('warn', message, meta);
  }

  public info(message: string, meta?: T): Logger<T> {
    return this.log('info', message, meta);
  }

  public verbose(message: string, meta?: T): Logger<T> {
    return this.log('verbose', message, meta);
  }

  public debug(message: string, meta?: T): Logger<T> {
    return this.log('debug', message, meta);
  }

  public silly(message: string, meta?: T): Logger<T> {
    return this.log('silly', message, meta);
  }
}

/**
 * Implements {@link BaseLogger} around a {@link SimpleLogger},
 * which can be swapped out a runtime.
 */
export class WrappingLogger<T = unknown> extends BaseLogger<T> {
  public logger: SimpleLogger<T>;

  public constructor(logger: SimpleLogger<T>) {
    super();
    this.logger = logger;
  }

  public log(level: LogLevel, message: string, meta?: T): this {
    this.logger.log(level, message, meta);
    return this;
  }
}
