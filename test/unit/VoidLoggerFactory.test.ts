import { VoidLogger } from '../../src/VoidLogger';
import { VoidLoggerFactory } from '../../src/VoidLoggerFactory';

describe('VoidLoggerFactory', (): void => {
  let factory: VoidLoggerFactory;
  beforeEach(async(): Promise<void> => {
    factory = new VoidLoggerFactory();
  });

  it('creates VoidLoggers.', async(): Promise<void> => {
    const logger = factory.createLogger('MyLabel');
    expect(logger).toBeInstanceOf(VoidLogger);
  });
});
