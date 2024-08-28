import { WrappingLogger } from './Logger';
import type { Logger } from './Logger';
import type { LoggerFactory } from './LoggerFactory';
import type { LogLevel } from './LogLevel';
import { VoidLoggerFactory } from './VoidLoggerFactory';

/**
 * Temporary {@link LoggerFactory} that buffers log messages in memory
 * until the {@link TemporaryLoggerFactory#switch} method is called.
 *
 * If the buffer gets filled we assume an actual factory will never be set,
 * so we switch to a {@link VoidLogger} and clear the buffer.
 * This can happen if a library that uses this logger is used as a dependency,
 * but the logger never gets set.
 * This way users are not forced to interact with the logging system if they just want to use the dependency.
 */
class TemporaryLoggerFactory<T = unknown> implements LoggerFactory<T> {
  protected bufferSpaces: number;
  protected readonly wrappers: { wrapper: WrappingLogger<T>; label: string }[] = [];
  protected readonly buffer: { logger: Logger<T>; level: LogLevel; message: string; meta?: T }[] = [];

  public constructor(bufferSize = 1024) {
    this.bufferSpaces = bufferSize;
  }

  public createLogger(label: string): WrappingLogger<T> {
    const wrapper = new WrappingLogger<T>({
      log: (level: LogLevel, message: string, meta?: T): Logger<T> =>
        this.bufferLogEntry(wrapper, level, message, meta),
    });
    this.wrappers.push({ wrapper, label });
    return wrapper;
  }

  protected bufferLogEntry(logger: WrappingLogger<T>, level: LogLevel, message: string, meta?: T): Logger<T> {
    // Buffer the message if spaces are still available
    if (this.bufferSpaces > 0) {
      this.bufferSpaces -= 1;
      // If this is the last space, assume logging is not required and change to a void logger
      if (this.bufferSpaces === 0) {
        // Clear the buffer
        this.buffer.length = 0;
        this.switch(new VoidLoggerFactory());
        return logger;
      }
      this.buffer.push({ logger, level, message, meta });
    }
    return logger;
  }

  /**
   * Swaps all lazy loggers to new loggers from the given factory,
   * and emits any buffered messages through those actual loggers.
   */
  public switch(loggerFactory: LoggerFactory<T>): void {
    // Instantiate an actual logger within every lazy logger
    for (const { wrapper, label } of this.wrappers.splice(0, this.wrappers.length)) {
      wrapper.logger = loggerFactory.createLogger(label);
    }
    // Emit all buffered log messages
    for (const { logger, level, message } of this.buffer.splice(0, this.buffer.length)) {
      logger.log(level, message);
    }
  }
}

/**
 * Wraps around another {@link LoggerFactory} that can be set lazily.
 * This is useful when objects are instantiated (and when they create loggers)
 * before the logging system has been fully instantiated,
 * as is the case when using a dependency injection framework such as Components.js.
 *
 * Loggers can be created even before a {@link LoggerFactory} is set;
 * any log messages will be buffered and re-emitted.
 */
export class LazyLoggerFactory<T = unknown> implements LoggerFactory<T> {
  protected factory: LoggerFactory<T>;

  public constructor(options: { bufferSize?: number } = {}) {
    this.factory = new TemporaryLoggerFactory(options.bufferSize);
  }

  public get loggerFactory(): LoggerFactory<T> {
    if (this.factory instanceof TemporaryLoggerFactory) {
      throw new TypeError('Logger factory not yet set.');
    }
    return this.factory;
  }

  public set loggerFactory(loggerFactory: LoggerFactory<T>) {
    if (this.factory instanceof TemporaryLoggerFactory) {
      this.factory.switch(loggerFactory);
    }
    this.factory = loggerFactory;
  }

  public createLogger(label: string): Logger<T> {
    return this.factory.createLogger(label);
  }
}
