import cluster from 'node:cluster';
import { PassThrough } from 'node:stream';
import type { Logger } from 'winston';
import type * as Transport from 'winston-transport';
import { WinstonLogger } from '../../src/WinstonLogger';
import { WinstonLoggerFactory } from '../../src/WinstonLoggerFactory';

const now = new Date();
jest.useFakeTimers();
jest.setSystemTime(now);

describe('WinstonLoggerFactory', (): void => {
  let factory: WinstonLoggerFactory;
  let transport: jest.Mocked<Transport>;

  beforeEach(async(): Promise<void> => {
    factory = new WinstonLoggerFactory('debug');

    // Create a dummy log transport
    transport = new PassThrough({ objectMode: true }) as any;
    jest.spyOn(transport, 'write').mockImplementation();
    // eslint-disable-next-line jest/prefer-spy-on
    transport.log = jest.fn();
  });

  it('creates WinstonLoggers.', async(): Promise<void> => {
    const logger = factory.createLogger('MyLabel');
    expect(logger).toBeInstanceOf(WinstonLogger);
    const innerLogger: Logger = (logger as any).logger;
    expect(innerLogger.level).toBe('debug');
    expect(innerLogger.format).toBeTruthy();
    expect(innerLogger.transports).toHaveLength(1);
  });

  it('allows WinstonLoggers to be invoked.', async(): Promise<void> => {
    (factory as any).createTransports = (): any => [ transport ];

    // Create logger, and log
    const logger = factory.createLogger('MyLabel');
    logger.log('debug', 'my message');

    expect(transport.write).toHaveBeenCalledTimes(1);
    // Need to check level like this as it has color tags
    const { level } = transport.write.mock.calls[0][0];
    expect(transport.write).toHaveBeenCalledWith({
      label: 'MyLabel',
      level,
      message: 'my message',
      timestamp: now.toISOString(),
      metadata: {},
      [Symbol.for('level')]: 'debug',
      [Symbol.for('splat')]: [ undefined ],
      [Symbol.for('message')]: `${now.toISOString()} [MyLabel] {Primary} ${level}: my message`,
    });
  });

  it('shows the PID in case of worker threads.', async(): Promise<void> => {
    (factory as any).createTransports = (): any => [ transport ];

    // Apparently we can just do this.
    // Which is great because I couldn't figure out how to mock this.
    const primary = cluster.isPrimary;
    (cluster as any).isPrimary = false;

    // Create logger, and log
    const logger = factory.createLogger('MyLabel');
    logger.log('debug', 'my message');

    expect(transport.write).toHaveBeenCalledTimes(1);
    // Need to check level like this as it has color tags
    const { level } = transport.write.mock.calls[0][0];
    expect(transport.write).toHaveBeenCalledWith(expect.objectContaining({
      label: 'MyLabel',
      level,
      message: 'my message',
      timestamp: now.toISOString(),
      metadata: {},
      [Symbol.for('level')]: 'debug',
      [Symbol.for('splat')]: [ undefined ],
      [Symbol.for('message')]: `${now.toISOString()} [MyLabel] {W-${process.pid}} ${level}: my message`,
    }));

    // Set this back
    (cluster as any).isPrimary = primary;
  });
});
