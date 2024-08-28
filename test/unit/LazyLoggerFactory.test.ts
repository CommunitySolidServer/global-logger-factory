import type { Logger } from 'winston';
import { LazyLoggerFactory } from '../../src/LazyLoggerFactory';
import type { LoggerFactory } from '../../src/LoggerFactory';
import { VoidLoggerFactory } from '../../src/VoidLoggerFactory';

jest.mock('../../src/VoidLoggerFactory');

describe('LazyLoggerFactory', (): void => {
  let lazyLoggerFactory: LazyLoggerFactory;
  let dummyLoggerFactory: jest.Mocked<LoggerFactory>;

  beforeEach(async(): Promise<void> => {
    lazyLoggerFactory = new LazyLoggerFactory();
    dummyLoggerFactory = {
      createLogger: jest.fn((): jest.Mocked<Logger> => ({
        log: jest.fn((): any => null),
      }) as any),
    } as any;
  });

  it('does not allow reading the internal factory before it is set.', (): void => {
    expect((): void => {
      expect(lazyLoggerFactory.loggerFactory).toBeNull();
    }).toThrow('Logger factory not yet set.');
  });

  it('allows setting the internal factory.', (): void => {
    lazyLoggerFactory.loggerFactory = dummyLoggerFactory;
    expect(lazyLoggerFactory.loggerFactory).toBe(dummyLoggerFactory);
  });

  it('creates loggers with the right labels.', (): void => {
    lazyLoggerFactory.createLogger('LoggerA');
    lazyLoggerFactory.createLogger('LoggerB');

    lazyLoggerFactory.loggerFactory = dummyLoggerFactory;

    expect(dummyLoggerFactory.createLogger).toHaveBeenCalledTimes(2);
    expect(dummyLoggerFactory.createLogger).toHaveBeenNthCalledWith(1, 'LoggerA');
    expect(dummyLoggerFactory.createLogger).toHaveBeenNthCalledWith(2, 'LoggerB');

    lazyLoggerFactory.createLogger('LoggerC');
    expect(dummyLoggerFactory.createLogger).toHaveBeenCalledTimes(3);
    expect(dummyLoggerFactory.createLogger).toHaveBeenNthCalledWith(3, 'LoggerC');
  });

  it('emits logged messages after a logger is set.', (): void => {
    const loggerA = lazyLoggerFactory.createLogger('LoggerA');
    const loggerB = lazyLoggerFactory.createLogger('LoggerB');
    loggerA.warn('message1');
    loggerB.warn('message2');
    loggerB.error('message3');
    loggerA.error('message4');

    lazyLoggerFactory.loggerFactory = dummyLoggerFactory;

    const wrappedA = dummyLoggerFactory.createLogger.mock.results[0].value as jest.Mocked<Logger>;
    expect(wrappedA.log).toHaveBeenCalledTimes(2);
    expect(wrappedA.log).toHaveBeenNthCalledWith(1, 'warn', 'message1', undefined);
    expect(wrappedA.log).toHaveBeenNthCalledWith(2, 'error', 'message4', undefined);

    const wrappedB = dummyLoggerFactory.createLogger.mock.results[1].value as jest.Mocked<Logger>;
    expect(wrappedB.log).toHaveBeenCalledTimes(2);
    expect(wrappedB.log).toHaveBeenNthCalledWith(1, 'warn', 'message2', undefined);
    expect(wrappedB.log).toHaveBeenNthCalledWith(2, 'error', 'message3', undefined);
  });

  it('changes to a VoidLogger if the buffer is full.', (): void => {
    const loggerMock = {
      log: jest.fn(),
    } satisfies Partial<Logger>;
    const factoryMock: jest.Mocked<VoidLoggerFactory> = {
      createLogger: jest.fn().mockReturnValue(loggerMock),
    } satisfies Partial<VoidLoggerFactory> as any;

    jest.mocked(VoidLoggerFactory).mockImplementation((): VoidLoggerFactory => factoryMock);

    lazyLoggerFactory = new LazyLoggerFactory({ bufferSize: 100 });
    const loggerA = lazyLoggerFactory.createLogger('LoggerA');
    const loggerB = lazyLoggerFactory.createLogger('LoggerB');

    for (let i = 0; i < 50; i++) {
      loggerA.info('info');
    }
    for (let i = 0; i < 50; i++) {
      loggerB.info('info');
    }

    lazyLoggerFactory.loggerFactory = dummyLoggerFactory;

    expect(VoidLoggerFactory).toHaveBeenCalledTimes(1);
    expect(factoryMock.createLogger).toHaveBeenCalledTimes(2);
    expect(loggerMock.log).toHaveBeenCalledTimes(0);
  });
});
