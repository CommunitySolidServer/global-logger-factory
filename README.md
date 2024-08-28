# Global logger factory

Provides utility functions to easily set up logging.
Due to the nature of this library,
any configuration changes you make have an effect on any library that makes use of it.

## Creating a new logger

The `getLoggerFor` can be used inside a class as follows:

```ts
import { getLoggerFor } from 'global-logger-factory';

class MyClass {
  protected readonly logger = getLoggerFor(this);

  public myFunction(): void {
    this.logger.info('Something is happening');
  }
}
```

By referencing the class itself in the `getLoggerFor` call, the class name can be used in the log messages.
Instead of using `this`, a string can also be used.

## Setting the logger factory

To define which kind of logger will be created when `getLoggerFor` is called,
`setGlobalLoggerFactory` needs to be called with an instance of a `LoggerFactory`.
This library comes with a `WinstonLoggerFactory` that can be used.

```ts
import { setGlobalLoggerFactory, WinstonLoggerFactory } from 'global-logger-factory';

setGlobalLoggerFactory(new WinstonLoggerFactory('info'));
```

After calling this, all calls to `getLoggerFor` will return a logger created by that factory.
Calls to `getLoggerFor`, and calls to the resulting loggers,
will be buffered until `setGlobalLoggerFactory` is called,
after which all messages will be emitted through the logger created by the new factory.

In case `setGlobalLoggerFactory` is not called before the buffer is full,
it is assumed a factory will not be set and the buffer is cleared and all following log messages will be ignored.

There is also a `VoidLoggerFactory` which simply disables logging.

## Setting the log level

The `WinstonLoggerFactory` takes as input the level of logged messages that should be emitted.
`new WinstonLoggerFactory('error')` will only emit error messages,
while `new WinstonLoggerFactory('info')` will emit error, warning, and info messages.

## Components.js

Component.js components are generated for each of the classes.
`config/logger.json` shows an example of how to set up a `WinstonLoggerFactory`,
using a Components.js variable to set the log level.

This exact configuration can be used directly into your own Components.js configuration by importing
`glf:config/logger.json`.
