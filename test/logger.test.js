////////////////////////////////////////////////////////////////////////////////
//
//    Copyright (c) 2022 - 2023.
//    Haixing Hu, Qubit Co. Ltd.
//
//    All rights reserved.
//
////////////////////////////////////////////////////////////////////////////////
import { Logger } from '../src';
import CustomizedAppender from './helper/customized-appender';
import { beforeEachHook, afterEachHook } from './helper/jest-hooks';

describe('Unit test of Logger', () => {
  beforeEach(() => {
    beforeEachHook();
    Logger.reset();
  });

  afterEach(() => {
    afterEachHook();
  });

  describe('Logger: constructor', () => {
    test('Cannot call the constructor directly', () => {
      expect(() => {
        new Logger('', console, 'ERROR');
      }).toThrowWithMessage(
        Error,
        'The `Logger` instance can only be constructed by the '
        + 'static method `Logger.getLogger()`.',
      );
    });
  });

  describe('Logger: getLogger() should work', () => {
    test('`Logger.getLogger() with the empty string as logger name', () => {
      const logger = Logger.getLogger('');
      expect(logger.getName()).toBe('');
    });
    test('`Logger.getLogger() with provided name', () => {
      const logger = Logger.getLogger('MyLogger');
      expect(logger.getName()).toBe('MyLogger');
    });
    test('`Logger.getLogger()` returns the same instance for the same name', () => {
      const logger1 = Logger.getLogger('MyLogger');
      const logger2 = Logger.getLogger('MyLogger');
      expect(logger1).toBe(logger2);
      const logger3 = Logger.getLogger();
      const logger4 = Logger.getLogger();
      expect(logger3).toBe(logger4);
    });
    test('`Logger.getLogger()` with default appender', () => {
      const logger1 = Logger.getLogger('MyLogger1');
      expect(logger1.getAppender()).toBe(Logger.getDefaultAppender());
      const appender = {
        trace: () => {},
        debug: () => {},
        info: () => {},
        warn: () => {},
        error: () => {},
      };
      Logger.setDefaultAppender(appender);
      const logger2 = Logger.getLogger('MyLogger2');
      expect(logger2.getAppender()).toBe(appender);
    });
    test('`Logger.getLogger()` with provided appender for new logger', () => {
      const appender = {
        trace: () => {},
        debug: () => {},
        info: () => {},
        warn: () => {},
        error: () => {},
      };
      const logger = Logger.getLogger('MyLogger', { appender });
      expect(logger.getAppender()).toBe(appender);
    });
    test('`Logger.getLogger()` with provided appender for existing logger', () => {
      const logger1 = Logger.getLogger('MyLogger');
      const appender = {
        trace: () => {},
        debug: () => {},
        info: () => {},
        warn: () => {},
        error: () => {},
      };
      const logger2 = Logger.getLogger('MyLogger', { appender });
      expect(logger1.getAppender()).toBe(appender);
      expect(logger2.getAppender()).toBe(appender);
    });
    test('`Logger.getLogger()` with default logging level', () => {
      const logger1 = Logger.getLogger('MyLogger1');
      expect(logger1.getLevel()).toBe(Logger.getDefaultLevel());
      Logger.setDefaultLevel('ERROR');
      const logger2 = Logger.getLogger('MyLogger2');
      expect(logger2.getLevel()).toBe('ERROR');
    });
    test('`Logger.getLogger()` with provided logging level for new logger', () => {
      Logger.setDefaultLevel('DEBUG');
      const logger1 = Logger.getLogger('MyLogger1');
      expect(logger1.getLevel()).toBe('DEBUG');
      const logger2 = Logger.getLogger('MyLogger2', { level: 'ERROR' });
      expect(logger2.getLevel()).toBe('ERROR');
    });
    test('`Logger.getLogger()` with provided lowercase logging level for new logger', () => {
      Logger.setDefaultLevel('DEBUG');
      const logger1 = Logger.getLogger('MyLogger1');
      expect(logger1.getLevel()).toBe('DEBUG');
      const logger2 = Logger.getLogger('MyLogger2', { level: 'error' });
      expect(logger2.getLevel()).toBe('ERROR');
    });
    test('`Logger.getLogger()` with provided logging level for existing logger', () => {
      Logger.setDefaultLevel('DEBUG');
      const logger1 = Logger.getLogger('MyLogger');
      expect(logger1.getLevel()).toBe('DEBUG');
      const logger2 = Logger.getLogger('MyLogger', { level: 'ERROR' });
      expect(logger1.getLevel()).toBe('ERROR');
      expect(logger2.getLevel()).toBe('ERROR');
    });
    test('`Logger.getLogger()` with provided lowercase logging level for existing logger', () => {
      Logger.setDefaultLevel('DEBUG');
      const logger1 = Logger.getLogger('MyLogger');
      expect(logger1.getLevel()).toBe('DEBUG');
      const logger2 = Logger.getLogger('MyLogger', { level: 'error' });
      expect(logger1.getLevel()).toBe('ERROR');
      expect(logger2.getLevel()).toBe('ERROR');
    });
  });

  describe('Logger: `getLogger()` with invalid logger name', () => {
    test('`Logger.getLogger()` must provide string as name', () => {
      expect(() => {
        Logger.getLogger(0);
      }).toThrowWithMessage(
        TypeError,
        'The name of a logger must be a string, and empty string is allowed.',
      );
    });
  });

  describe('Logger: `getLogger()` with invalid appender', () => {
    const NOOP = () => {};
    test('Appender is null', () => {
      expect(() => Logger.getLogger('test', { appender: null }))
        .toThrowWithMessage(
          TypeError,
          'The appender for a logger must be a non-null object.',
        );
    });
    test('Appender is a string', () => {
      expect(() => Logger.getLogger('test', { appender: 'hello' }))
        .toThrowWithMessage(
          TypeError,
          'The appender for a logger must be a non-null object.',
        );
    });
    test('Appender has no trace() function', () => {
      expect(() => Logger.getLogger('test', {
        appender: {
          debug: NOOP,
          info: NOOP,
          warn: NOOP,
          error: NOOP,
        },
      })).toThrowWithMessage(
        Error,
        'The appender of this logger has no trace() method.',
      );
    });
    test('Appender has no debug() function', () => {
      expect(() => Logger.getLogger('test', {
        appender: {
          trace: NOOP,
          info: NOOP,
          warn: NOOP,
          error: NOOP,
        },
      })).toThrowWithMessage(
        Error,
        'The appender of this logger has no debug() method.',
      );
    });
    test('Appender has no info() function', () => {
      expect(() => Logger.getLogger('test', {
        appender: {
          trace: NOOP,
          debug: NOOP,
          warn: NOOP,
          error: NOOP,
        },
      })).toThrowWithMessage(
        Error,
        'The appender of this logger has no info() method.',
      );
    });
    test('Appender has no warn() function', () => {
      expect(() => Logger.getLogger('test', {
        appender: {
          trace: NOOP,
          debug: NOOP,
          info: NOOP,
          error: NOOP,
        },
      }))
        .toThrowWithMessage(
          Error,
          'The appender of this logger has no warn() method.',
        );
    });
    test('Appender has no error() function', () => {
      expect(() => Logger.getLogger('test', {
        appender: {
          trace: NOOP,
          debug: NOOP,
          info: NOOP,
          warn: NOOP,
        },
      }))
        .toThrowWithMessage(
          Error,
          'The appender of this logger has no error() method.',
        );
    });
  });

  describe('Logger: `getLogger()` with invalid logging level', () => {
    test('logging level is not string', () => {
      expect(() => Logger.getLogger('test', { level: 0 }))
        .toThrowWithMessage(TypeError, 'The logging level must be a string.');
    });
    test('logging level is not predefined', () => {
      expect(() => Logger.getLogger('test', { level: 'xxx' }))
        .toThrowWithMessage(
          RangeError,
          'Unknown logging level "XXX". '
        + 'Possible values are：["TRACE","DEBUG","INFO","WARN","ERROR","NONE"].',
        );
    });
  });

  describe('Logger: Use console appender', () => {
    test('logger.trace', () => {
      const logger = Logger.getLogger();
      const arg1 = 'hello';
      const arg2 = {
        name: 'world',
        value: { id: 123, data: 'abc' },
      };
      logger.trace('This is a TRACE message: %s, '
        + 'and another is %o, that is all.', arg1, arg2);
    });
    test('logger.debug', () => {
      const logger = Logger.getLogger();
      const arg1 = 'hello';
      const arg2 = {
        name: 'world',
        value: { id: 123, data: 'abc' },
      };
      logger.debug('This is a DEBUG message: %s, '
        + 'and another is %o, that is all.', arg1, arg2);
    });
    test('logger.info', () => {
      const logger = Logger.getLogger();
      const arg1 = 'hello';
      const arg2 = {
        name: 'world',
        value: { id: 123, data: 'abc' },
      };
      logger.info('This is a INFO message: %s, '
        + 'and another is %o, that is all.', arg1, arg2);
    });
    test('logger.warn', () => {
      const logger = Logger.getLogger();
      const arg1 = 'hello';
      const arg2 = {
        name: 'world',
        value: { id: 123, data: 'abc' },
      };
      logger.warn('This is a WARN message: %s, '
        + 'and another is %o, that is all.', arg1, arg2);
    });
    test('logger.error', () => {
      const logger = Logger.getLogger();
      const arg1 = 'hello';
      const arg2 = {
        name: 'world',
        value: { id: 123, data: 'abc' },
      };
      logger.error('This is a ERROR message: %s, '
        + 'and another is %o, that is all.', arg1, arg2);
    });
    test('logger.log', () => {
      const logger = Logger.getLogger();
      const arg1 = 'hello';
      const arg2 = {
        name: 'world',
        value: { id: 123, data: 'abc' },
      };
      logger.log('trace', 'This is a TRACE message: %s, '
        + 'and another is %o, that is all.', arg1, arg2);
      logger.log('debug', 'This is a DEBUG message: %s, '
        + 'and another is %o, that is all.', arg1, arg2);
      logger.log('info', 'This is a INFO message: %s, '
        + 'and another is %o, that is all.', arg1, arg2);
      logger.log('warn', 'This is a WARN message: %s, '
        + 'and another is %o, that is all.', arg1, arg2);
      logger.log('error', 'This is a ERROR message: %s, '
        + 'and another is %o, that is all.', arg1, arg2);
      logger.log('xxxx', 'This is a XXXX message: %s, '
        + 'and another is %o, that is all.', arg1, arg2);
    });
  });

  describe('Logger: Use customized appender', () => {
    const appender = new CustomizedAppender();
    test('logger.trace', () => {
      const logger = Logger.getLogger('MyLogger', { appender, level: 'TRACE' });
      const arg1 = 'hello';
      const arg2 = {
        name: 'world',
        value: 123,
      };
      logger.trace('This is a TRACE message: %s, '
        + 'and another is %d, that is all.', arg1, arg2);
      expect(appender.logs.length).toBe(1);
      expect(appender.logs[0].type).toBe('TRACE');
      expect(appender.logs[0].args).toEqual([
        '[TRACE] MyLogger - %s',
        'This is a TRACE message: %s, and another is %d, that is all.',
        arg1,
        arg2,
      ]);
    });
    test('logger.debug', () => {
      const logger = Logger.getLogger('MyLogger', { appender, level: 'TRACE' });
      const arg1 = 'hello';
      const arg2 = {
        name: 'world',
        value: 123,
      };
      logger.debug('This is a DEBUG message: %s, '
        + 'and another is %d, that is all.', arg1, arg2);
      expect(appender.logs.length).toBe(2);
      expect(appender.logs[1].type).toBe('DEBUG');
      expect(appender.logs[1].args).toEqual([
        '[DEBUG] MyLogger - %s',
        'This is a DEBUG message: %s, and another is %d, that is all.',
        arg1,
        arg2,
      ]);
    });
    test('logger.info', () => {
      const logger = Logger.getLogger('MyLogger', { appender, level: 'TRACE' });
      const arg1 = 'hello';
      const arg2 = {
        name: 'world',
        value: 123,
      };
      logger.info('This is a INFO message: %s, '
        + 'and another is %d, that is all.', arg1, arg2);
      expect(appender.logs.length).toBe(3);
      expect(appender.logs[2].type).toBe('INFO');
      expect(appender.logs[2].args).toEqual([
        '[INFO] MyLogger - %s',
        'This is a INFO message: %s, and another is %d, that is all.',
        arg1,
        arg2,
      ]);
    });
    test('logger.warn', () => {
      const logger = Logger.getLogger('MyLogger', { appender, level: 'TRACE' });
      const arg1 = 'hello';
      const arg2 = {
        name: 'world',
        value: 123,
      };
      logger.warn('This is a WARN message: %s, '
        + 'and another is %d, that is all.', arg1, arg2);
      expect(appender.logs.length).toBe(4);
      expect(appender.logs[3].type).toBe('WARN');
      expect(appender.logs[3].args).toEqual([
        '[WARN] MyLogger - %s',
        'This is a WARN message: %s, and another is %d, that is all.',
        arg1,
        arg2,
      ]);
    });
    test('logger.error', () => {
      const logger = Logger.getLogger('MyLogger', { appender, level: 'TRACE' });
      const arg1 = 'hello';
      const arg2 = {
        name: 'world',
        value: 123,
      };
      logger.error('This is a ERROR message: %s, '
        + 'and another is %d, that is all.', arg1, arg2);
      expect(appender.logs.length).toBe(5);
      expect(appender.logs[4].type).toBe('ERROR');
      expect(appender.logs[4].args).toEqual([
        '[ERROR] MyLogger - %s',
        'This is a ERROR message: %s, and another is %d, that is all.',
        arg1,
        arg2,
      ]);
    });
    test('logger.log with trace level', () => {
      const logger = Logger.getLogger('MyLogger', { appender, level: 'TRACE' });
      const arg1 = 'hello';
      const arg2 = {
        name: 'world',
        value: 123,
      };
      logger.log('trace', 'This is a TRACE message: %s, '
        + 'and another is %d, that is all.', arg1, arg2);
      expect(appender.logs.length).toBe(6);
      expect(appender.logs[5].type).toBe('TRACE');
      expect(appender.logs[5].args).toEqual([
        '[TRACE] MyLogger - %s',
        'This is a TRACE message: %s, and another is %d, that is all.',
        arg1,
        arg2,
      ]);
    });
    test('logger.log with debug level', () => {
      const logger = Logger.getLogger('MyLogger', { appender, level: 'TRACE' });
      const arg1 = 'hello';
      const arg2 = {
        name: 'world',
        value: 123,
      };
      logger.log('debug', 'This is a DEBUG message: %s, '
        + 'and another is %d, that is all.', arg1, arg2);
      expect(appender.logs.length).toBe(7);
      expect(appender.logs[6].type).toBe('DEBUG');
      expect(appender.logs[6].args).toEqual([
        '[DEBUG] MyLogger - %s',
        'This is a DEBUG message: %s, and another is %d, that is all.',
        arg1,
        arg2,
      ]);
    });
    test('logger.log with info level', () => {
      const logger = Logger.getLogger('MyLogger', { appender, level: 'TRACE' });
      const arg1 = 'hello';
      const arg2 = {
        name: 'world',
        value: 123,
      };
      logger.log('info', 'This is a INFO message: %s, '
        + 'and another is %d, that is all.', arg1, arg2);
      expect(appender.logs.length).toBe(8);
      expect(appender.logs[7].type).toBe('INFO');
      expect(appender.logs[7].args).toEqual([
        '[INFO] MyLogger - %s',
        'This is a INFO message: %s, and another is %d, that is all.',
        arg1,
        arg2,
      ]);
    });
    test('logger.log with warn level', () => {
      const logger = Logger.getLogger('MyLogger', { appender, level: 'TRACE' });
      const arg1 = 'hello';
      const arg2 = {
        name: 'world',
        value: 123,
      };
      logger.log('warn', 'This is a WARN message: %s, '
        + 'and another is %d, that is all.', arg1, arg2);
      expect(appender.logs.length).toBe(9);
      expect(appender.logs[8].type).toBe('WARN');
      expect(appender.logs[8].args).toEqual([
        '[WARN] MyLogger - %s',
        'This is a WARN message: %s, and another is %d, that is all.',
        arg1,
        arg2,
      ]);
    });
    test('logger.log with error level', () => {
      const logger = Logger.getLogger('MyLogger', { appender, level: 'TRACE' });
      const arg1 = 'hello';
      const arg2 = {
        name: 'world',
        value: 123,
      };
      logger.log('error', 'This is a ERROR message: %s, '
        + 'and another is %d, that is all.', arg1, arg2);
      expect(appender.logs.length).toBe(10);
      expect(appender.logs[9].type).toBe('ERROR');
      expect(appender.logs[9].args).toEqual([
        '[ERROR] MyLogger - %s',
        'This is a ERROR message: %s, and another is %d, that is all.',
        arg1,
        arg2,
      ]);
    });
    test('logger.log with xxx level', () => {
      const logger = Logger.getLogger('MyLogger', { appender, level: 'TRACE' });
      const arg1 = 'hello';
      const arg2 = {
        name: 'world',
        value: 123,
      };
      logger.log('xxx', 'This is a ERROR message: %s, '
        + 'and another is %d, that is all.', arg1, arg2);
      expect(appender.logs.length).toBe(10);
    });
    test('logger.info with first argument as object', () => {
      const logger = Logger.getLogger('MyLogger', { appender, level: 'TRACE' });
      const arg1 = 'hello';
      const arg2 = {
        name: 'world',
        value: 123,
      };
      logger.info(arg2, arg1);
      expect(appender.logs.length).toBe(11);
      expect(appender.logs[10].type).toBe('INFO');
      expect(appender.logs[10].args).toEqual([
        '[INFO] MyLogger - %s', // FIXME: the prefix should be '[INFO] MyLogger - '
        arg2,
        arg1,
      ]);
    });
  });

  describe('Logger: set logging level', () => {
    test('correct logging level in getLogger', () => {
      const appender = new CustomizedAppender();
      const logger = Logger.getLogger('MyLogger1', { appender, level: 'ERROR' });
      logger.trace('TRACE level should not be logged');
      logger.debug('DEBUG level should not be logged');
      logger.info('INFO level should not be logged');
      logger.warn('WARN level should not be logged');
      logger.error('ERROR level should be logged');
      expect(appender.logs.length).toBe(1);
      expect(appender.logs[0].type).toBe('ERROR');
      expect(appender.logs[0].args).toEqual([
        '[ERROR] MyLogger1 - %s',
        'ERROR level should be logged',
      ]);
    });
    test('wrong logging level in getLogger', () => {
      expect(() => {
        Logger.getLogger('MyLogger2', { appender: console, level: 'XXX' });
      }).toThrowWithMessage(
        RangeError,
        'Unknown logging level "XXX". '
        + 'Possible values are：["TRACE","DEBUG","INFO","WARN","ERROR","NONE"].',
      );
    });
    test('correct logging level in setLevel()', () => {
      const appender = new CustomizedAppender();
      const logger = Logger.getLogger('MyLogger3', { appender, level: 'DEBUG' });
      logger.debug('DEBUG level should be logged');
      expect(appender.logs.length).toBe(1);
      expect(appender.logs[0]).toEqual({
        type: 'DEBUG',
        args: [
          '[DEBUG] MyLogger3 - %s',
          'DEBUG level should be logged',
        ],
      });
      logger.setLevel('ERROR');
      logger.info('INFO level should not be logged');
      logger.warn('WARN level should not be logged');
      logger.error('ERROR level should be logged');
      expect(appender.logs.length).toBe(2);
      expect(appender.logs[1]).toEqual({
        type: 'ERROR',
        args: [
          '[ERROR] MyLogger3 - %s',
          'ERROR level should be logged',
        ],
      });
    });
    test('wrong logging level in setLevel()', () => {
      const logger = Logger.getLogger();
      expect(() => {
        logger.setLevel('YYYY');
      }).toThrowWithMessage(
        RangeError,
        'Unknown logging level "YYYY". '
        + 'Possible values are：["TRACE","DEBUG","INFO","WARN","ERROR","NONE"].',
      );
    });
  });

  describe('Logger: set/get the default logging level', () => {
    test('set correct default logging level', () => {
      Logger.setDefaultLevel('ERROR');
      const appender = new CustomizedAppender();
      const logger = Logger.getLogger('MyLogger4', { appender });
      logger.trace('TRACE level should not be logged');
      logger.debug('DEBUG level should not be logged');
      logger.info('INFO level should not be logged');
      logger.warn('WARN level should not be logged');
      logger.error('ERROR level should be logged');
      expect(appender.logs.length).toBe(1);
      expect(appender.logs[0].type).toBe('ERROR');
      expect(appender.logs[0].args).toEqual([
        '[ERROR] MyLogger4 - %s',
        'ERROR level should be logged',
      ]);
    });
    test('get default logging level', () => {
      Logger.setDefaultLevel('ERROR');
      const level = Logger.getDefaultLevel();
      expect(level).toBe('ERROR');
    });
    test('wrong logging level in Logger.setDefaultLevel()', () => {
      expect(() => {
        Logger.setDefaultLevel('YYYY');
      }).toThrowWithMessage(
        RangeError,
        'Unknown logging level "YYYY". '
        + 'Possible values are：["TRACE","DEBUG","INFO","WARN","ERROR","NONE"].',
      );
    });
  });

  describe('Logger: set/reset the default appender', () => {
    test('Logger.setDefaultAppender() and Logger.resetDefaultAppender() should work', () => {
      const logger1 = Logger.getLogger('l1');
      const logger2 = Logger.getLogger('l2');
      const logger3 = Logger.getLogger('l3');
      const oldAppender = Logger.getDefaultAppender();
      expect(logger1.getAppender()).toBe(oldAppender);
      expect(logger2.getAppender()).toBe(oldAppender);
      expect(logger3.getAppender()).toBe(oldAppender);
      const newAppender = new CustomizedAppender();
      Logger.setDefaultAppender(newAppender);
      const logger4 = Logger.getLogger('l4');
      expect(logger1.getAppender()).toBe(oldAppender);
      expect(logger2.getAppender()).toBe(oldAppender);
      expect(logger3.getAppender()).toBe(oldAppender);
      expect(logger4.getAppender()).toBe(newAppender);
      Logger.resetDefaultAppender();
      const defaultAppender = Logger.getDefaultAppender();
      expect(defaultAppender).toBe(oldAppender);
      const logger5 = Logger.getLogger('l5');
      expect(logger1.getAppender()).toBe(oldAppender);
      expect(logger2.getAppender()).toBe(oldAppender);
      expect(logger3.getAppender()).toBe(oldAppender);
      expect(logger4.getAppender()).toBe(newAppender);
      expect(logger5.getAppender()).toBe(oldAppender);
    });
    test('Logger.setDefaultAppender() with invalid appender', () => {
      const NOOP = () => {};
      expect(() => Logger.setDefaultAppender(null)).toThrowWithMessage(
        TypeError,
        'The appender for a logger must be a non-null object.',
      );
      expect(() => Logger.setDefaultAppender('hello')).toThrowWithMessage(
        TypeError,
        'The appender for a logger must be a non-null object.',
      );
      expect(() => Logger.setDefaultAppender({
        debug: NOOP,
        info: NOOP,
        warn: NOOP,
        error: NOOP,
      })).toThrowWithMessage(
        Error,
        'The appender of this logger has no trace() method.',
      );
      expect(() => Logger.setDefaultAppender({
        trace: NOOP,
        info: NOOP,
        warn: NOOP,
        error: NOOP,
      })).toThrowWithMessage(
        Error,
        'The appender of this logger has no debug() method.',
      );
      expect(() => Logger.setDefaultAppender({
        trace: NOOP,
        debug: NOOP,
        warn: NOOP,
        error: NOOP,
      })).toThrowWithMessage(
        Error,
        'The appender of this logger has no info() method.',
      );
      expect(() => Logger.setDefaultAppender({
        trace: NOOP,
        debug: NOOP,
        info: NOOP,
        error: NOOP,
      })).toThrowWithMessage(
        Error,
        'The appender of this logger has no warn() method.',
      );
      expect(() => Logger.setDefaultAppender({
        trace: NOOP,
        debug: NOOP,
        info: NOOP,
        warn: NOOP,
      })).toThrowWithMessage(
        Error,
        'The appender of this logger has no error() method.',
      );
    });
  });

  describe('Logger: set/reset all logging level', () => {
    test('correct logging level in Logger.setAllLevels()', () => {
      const l1 = Logger.getLogger('l1');
      const l2 = Logger.getLogger('l2');
      const l3 = Logger.getLogger('l3');
      const logger = Logger.getLogger();
      Logger.setAllLevels('ERROR');
      expect(l1.getLevel()).toBe('ERROR');
      expect(l2.getLevel()).toBe('ERROR');
      expect(l3.getLevel()).toBe('ERROR');
      expect(logger.getLevel()).toBe('ERROR');
    });
    test('wrong logging level in Logger.setAllLevels()', () => {
      expect(() => {
        Logger.setDefaultLevel('YYYY');
      }).toThrowWithMessage(
        RangeError,
        'Unknown logging level "YYYY". '
        + 'Possible values are：["TRACE","DEBUG","INFO","WARN","ERROR","NONE"].',
      );
    });
    test('reset all logging levels', () => {
      const l1 = Logger.getLogger('l1');
      const l2 = Logger.getLogger('l2');
      const l3 = Logger.getLogger('l3');
      const logger = Logger.getLogger();
      const defaultLevel = Logger.getDefaultLevel();
      Logger.resetAllLevels();
      expect(l1.getLevel()).toBe(defaultLevel);
      expect(l2.getLevel()).toBe(defaultLevel);
      expect(l3.getLevel()).toBe(defaultLevel);
      expect(logger.getLevel()).toBe(defaultLevel);
    });
  });

  describe('Logger: set/reset all appenders', () => {
    test('Logger.setAllAppenders() and Logger.resetAllAppenders() should work', () => {
      const logger1 = Logger.getLogger('l1');
      const logger2 = Logger.getLogger('l2');
      const logger3 = Logger.getLogger('l3');
      const defaultAppender = Logger.getDefaultAppender();
      expect(logger1.getAppender()).toBe(defaultAppender);
      expect(logger2.getAppender()).toBe(defaultAppender);
      expect(logger3.getAppender()).toBe(defaultAppender);
      const appender = new CustomizedAppender();
      Logger.setAllAppenders(appender);
      expect(logger1.getAppender()).toBe(appender);
      expect(logger2.getAppender()).toBe(appender);
      expect(logger3.getAppender()).toBe(appender);
      expect(Logger.getDefaultAppender()).toBe(defaultAppender);
      const logger4 = Logger.getLogger('l4');
      expect(logger4.getAppender()).toBe(defaultAppender);
      Logger.resetAllAppenders();
      expect(logger1.getAppender()).toBe(defaultAppender);
      expect(logger2.getAppender()).toBe(defaultAppender);
      expect(logger3.getAppender()).toBe(defaultAppender);
      expect(logger4.getAppender()).toBe(defaultAppender);
    });
    test('Logger.setAllAppenders() with invalid appender', () => {
      const NOOP = () => {};
      expect(() => Logger.setAllAppenders(null))
        .toThrowWithMessage(
          TypeError,
          'The appender for a logger must be a non-null object.',
        );
      expect(() => Logger.setAllAppenders('hello'))
        .toThrowWithMessage(
          TypeError,
          'The appender for a logger must be a non-null object.',
        );
      expect(() => Logger.setAllAppenders({
        debug: NOOP,
        info: NOOP,
        warn: NOOP,
        error: NOOP,
      })).toThrowWithMessage(
        Error,
        'The appender of this logger has no trace() method.',
      );
      expect(() => Logger.setAllAppenders({
        trace: NOOP,
        info: NOOP,
        warn: NOOP,
        error: NOOP,
      })).toThrowWithMessage(
        Error,
        'The appender of this logger has no debug() method.',
      );
      expect(() => Logger.setAllAppenders({
        trace: NOOP,
        debug: NOOP,
        warn: NOOP,
        error: NOOP,
      })).toThrowWithMessage(
        Error,
        'The appender of this logger has no info() method.',
      );
      expect(() => Logger.setAllAppenders({
        trace: NOOP,
        debug: NOOP,
        info: NOOP,
        error: NOOP,
      })).toThrowWithMessage(
        Error,
        'The appender of this logger has no warn() method.',
      );
      expect(() => Logger.setAllAppenders({
        trace: NOOP,
        debug: NOOP,
        info: NOOP,
        warn: NOOP,
      })).toThrowWithMessage(
        Error,
        'The appender of this logger has no error() method.',
      );
    });
  });

  describe('Logger: enable/disable', () => {
    test('logger.enable(), logger.disable() should work', () => {
      const appender = new CustomizedAppender();
      const logger = Logger.getLogger('MyLogger', { appender, level: 'INFO' });
      logger.trace('TRACE level should not be logged');
      logger.debug('DEBUG level should not be logged');
      logger.info('INFO level should not be logged');
      logger.warn('WARN level should not be logged');
      logger.error('ERROR level should be logged');
      expect(appender.logs.length).toBe(3);
      expect(appender.logs[0].type).toBe('INFO');
      expect(appender.logs[1].type).toBe('WARN');
      expect(appender.logs[2].type).toBe('ERROR');
      logger.disable();
      logger.trace('TRACE level should not be logged');
      logger.debug('DEBUG level should not be logged');
      logger.info('INFO level should not be logged');
      logger.warn('WARN level should not be logged');
      logger.error('ERROR level should be logged');
      expect(appender.logs.length).toBe(3);
      logger.enable();
      logger.trace('TRACE level should not be logged');
      logger.debug('DEBUG level should not be logged');
      logger.info('INFO level should not be logged');
      logger.warn('WARN level should not be logged');
      logger.error('ERROR level should be logged');
      expect(appender.logs.length).toBe(6);
      expect(appender.logs[0].type).toBe('INFO');
      expect(appender.logs[1].type).toBe('WARN');
      expect(appender.logs[2].type).toBe('ERROR');
      expect(appender.logs[3].type).toBe('INFO');
      expect(appender.logs[4].type).toBe('WARN');
      expect(appender.logs[5].type).toBe('ERROR');
    });
    test('logger.setEnabled() should work', () => {
      const appender = new CustomizedAppender();
      const logger = Logger.getLogger('MyLogger', { appender, level: 'INFO' });
      logger.trace('TRACE level should not be logged');
      logger.debug('DEBUG level should not be logged');
      logger.info('INFO level should not be logged');
      logger.warn('WARN level should not be logged');
      logger.error('ERROR level should be logged');
      expect(appender.logs.length).toBe(3);
      expect(appender.logs[0].type).toBe('INFO');
      expect(appender.logs[1].type).toBe('WARN');
      expect(appender.logs[2].type).toBe('ERROR');
      logger.setEnabled(false);
      logger.trace('TRACE level should not be logged');
      logger.debug('DEBUG level should not be logged');
      logger.info('INFO level should not be logged');
      logger.warn('WARN level should not be logged');
      logger.error('ERROR level should be logged');
      expect(appender.logs.length).toBe(3);
      logger.setEnabled(true);
      logger.trace('TRACE level should not be logged');
      logger.debug('DEBUG level should not be logged');
      logger.info('INFO level should not be logged');
      logger.warn('WARN level should not be logged');
      logger.error('ERROR level should be logged');
      expect(appender.logs.length).toBe(6);
      expect(appender.logs[0].type).toBe('INFO');
      expect(appender.logs[1].type).toBe('WARN');
      expect(appender.logs[2].type).toBe('ERROR');
      expect(appender.logs[3].type).toBe('INFO');
      expect(appender.logs[4].type).toBe('WARN');
      expect(appender.logs[5].type).toBe('ERROR');
    });
  });

  describe('Logger: getLoggerLevel/setLoggerLevel', () => {
    test('getLoggerLevel returns default level for non-existing logger', () => {
      const name = 'nonExistingLogger';
      expect(Logger.getLoggerLevel(name)).toBe(Logger.getDefaultLevel());
      Logger.setDefaultLevel('ERROR');
      expect(Logger.getLoggerLevel(name)).toBe('ERROR');
    });

    test('set and get logger level', () => {
      const name = 'testLogger';
      const levels = ['TRACE', 'DEBUG', 'INFO', 'WARN', 'ERROR', 'NONE'];
      levels.forEach((level) => {
        Logger.setLoggerLevel(name, level);
        expect(Logger.getLoggerLevel(name)).toBe(level);
      });
    });

    test('setting invalid logger level should throw error', () => {
      const name = 'testLogger';
      const invalidLevel = 'INVALID_LEVEL';
      expect(() => Logger.setLoggerLevel(name, invalidLevel)).toThrow();
    });

    test('setLoggerLevel affects existing logger instance', () => {
      const name = 'testLogger';
      const logger = Logger.getLogger(name);
      const newLevel = 'ERROR';
      Logger.setLoggerLevel(name, newLevel);
      expect(logger.getLevel()).toBe(newLevel);
    });

    test('setLoggerLevel does not affect other loggers', () => {
      const name1 = 'logger1';
      const name2 = 'logger2';
      const logger1 = Logger.getLogger(name1);
      const logger2 = Logger.getLogger(name2);
      const newLevel = (Logger.getDefaultLevel() === 'ERROR' ? 'INFO' : 'ERROR');

      Logger.setLoggerLevel(name1, newLevel);
      expect(logger1.getLevel()).toBe(newLevel);
      expect(logger2.getLevel()).not.toBe(newLevel);
    });
  });
});
