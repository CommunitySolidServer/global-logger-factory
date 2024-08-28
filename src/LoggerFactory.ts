import type { Logger } from './Logger';

/**
 * Instantiates new logger instances.
 */
export interface LoggerFactory<T = unknown> {
  /**
   * Create a logger instance for the given label.
   *
   * @param label - A label that is used to identify the given logger.
   */
  createLogger: (label: string) => Logger<T>;
}
