////////////////////////////////////////////////////////////////////////////////
//
//    Copyright (c) 2022 - 2023.
//    Haixing Hu, Qubit Co. Ltd.
//
//    All rights reserved.
//
////////////////////////////////////////////////////////////////////////////////
import {
  NOOP,
  LOGGING_LEVELS,
  checkAppend,
  checkLoggingLevel,
  upperCaseString,
} from './logger-utils';

/**
 * The factory value of the Logger class's default logging level,
 * which is `DEBUG`.
 *
 * @type {string}
 */
const FACTORY_DEFAULT_LEVEL = 'DEBUG';

/**
 * The factory value of the Logger class's default log appender, which is
 * the standard output pipe of the console.
 *
 * @type {Console}
 */
const FACTORY_DEFAULT_APPENDER = console;

/**
 * The default logging level of all `Logger` instances, which is `DEBUG`.
 *
 * @private
 * @author Haixing Hu
 */
let __defaultLevel = FACTORY_DEFAULT_LEVEL;

/**
 * The default log appender of all `Logger` instances, which is the standard
 * output pipe of the console.
 *
 * @private
 * @author Haixing Hu
 */
let __defaultAppender = FACTORY_DEFAULT_APPENDER;

/**
 * The map of all `Logger` instances.
 *
 * This value maps the name of a `Logger` instance to its instance.
 *
 * @type {Map<String, Logger>}
 * @private
 * @author Haixing Hu
 */
const __loggerMap = new Map();

/**
 * The map of all logging levels.
 *
 * This value maps the name of a `Logger` instance to its logging level.
 *
 * @type {Map<String, String>}
 * @private
 * @author Haixing Hu
 */
const __levelMap = new Map();

/**
 * Indicates whether the `Logger` instance is under internal constructing.
 *
 * Many other languages include the capability to mark a constructor as private,
 * which prevents the class from being instantiated outside the class itself,
 * such taht you can only use static factory methods that create instances, or
 * not be able to create instances at all. JavaScript does not have a native way
 * to do this, but it can be accomplished by using a private static flag.
 *
 * @type {boolean}
 * @private
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_class_fields#simulating_private_constructors
 * @author Haixing Hu
 */
let __isInternalConstructing = false;

/**
 * A simple logging class.
 *
 * A `Logger` object provides the following logging methods:
 *
 * - `Logger.trace(message, arg1, arg2, ...)`: Outputs a log message with the `TRACE` level.
 * - `Logger.debug(message, arg1, arg2, ...)`: Outputs a log message with the `DEBUG` level.
 * - `Logger.info(message, arg1, arg2, ...)`: Outputs a log message with the `INFO` level.
 * - `Logger.warn(message, arg1, arg2, ...)`: Outputs a log message with the `WARN` level.
 * - `Logger.error(message, arg1, arg2, ...)`: Outputs a log message with the `ERROR` level.
 * - `Logger.log(level, message, arg1, arg2, ...)`: Outputs a log message with the specified level.
 *
 * The message argument of those logging methods supports the following
 * substitution patterns:
 *
 * - `%o` or `%O`: Outputs a JavaScript object. Clicking the object name opens
 *    more information about it in the inspector.
 * - `%d` or `%i`: Outputs an integer. Number formatting is supported, for
 *   example `logger.info('Foo %.2d', 1.1)` will output the number as two
 *   significant figures with a leading 0: `Foo 01`.
 * - `%s`: Outputs a string.
 * - `%f`: Outputs a floating-point value. Formatting is supported, for example
 *   `logger.debug("Foo %.2f", 1.1)` will output the number to 2 decimal
 *   places: `Foo 1.10`.
 *
 * @author Haixing Hu
 */
class Logger {
  /**
   * Gets the `Logger` instance of the specified name, or constructs a new
   * `Logger` instance if it does not exist.
   *
   * @param {string} name
   *     The name of the `Logger` instance to be retrieved.
   * @param {Object} options
   *     The optional options of the `Logger` instance to be retrieved. This
   *     option object may have the following properties:
   *     - `appender: object`: the specified content output pipe of the log.
   *       This object must provide `trace`, `debug`, `info`, `warn` and `error`
   *       methods. If this option is not provided, the appender of the existing
   *       `Logger` instance will not be changed, and the default appender
   *       will be used to construct a new `Logger` instance if it does not exist.
   *     - `level: string`: the logging level of the `Logger` instance to be
   *       retrieved. The allowed levels are `TRACE`, `DEBUG`, `INFO`, `WARN`,
   *       `ERROR`, and `NONE`. Lowercase letters are also allowed. If this
   *       option is not provided, the logging level of the existing `Logger`
   *       instance will not be changed, and the default logging level will be
   *       used to construct a new `Logger` instance if it does not exist.
   * @return {Logger}
   *       The `Logger` instance of the specified name, which either be the
   *       existing one or a newly constructed one.
   */
  static getLogger(name = '', options = {}) {
    if (typeof name !== 'string') {
      throw new TypeError('The name of a logger must be a string, and empty string is allowed.');
    }
    let logger = __loggerMap.get(name);
    if (logger === undefined) {
      // sets the internally constructing flag before constructing a instance
      __isInternalConstructing = true;
      logger = new Logger(name, options.appender, options.level);
      // clear the internally constructing flag after constructing the new instance
      __isInternalConstructing = false;
      __loggerMap.set(name, logger);
    } else {
      if (options.appender !== undefined) {
        logger.setAppender(options.appender);
      }
      if (options.level !== undefined) {
        logger.setLevel(options.level);
      }
    }
    return logger;
  }

  /**
   * Clears all existing `Logger` instances.
   */
  static clearAllLoggers() {
    __loggerMap.clear();
    __levelMap.clear();
  }

  /**
   * Gets the logging level of the `Logger` instance of the specified name.
   *
   * @param name
   *     The name of the `Logger` instance.
   * @returns {string}
   *     The logging level of the `Logger` instance of the specified name. If the
   *     `Logger` instance of the specified name does not exist, the default
   *     logging level will be returned.
   */
  static getLoggerLevel(name) {
    const level = __levelMap.get(name);
    return level ?? __defaultLevel;
  }

  /**
   * Sets the logging level of the `Logger` instance of the specified name.
   *
   * @param name
   *     The name of the `Logger` instance.
   * @param level
   *     The new logging level of the `Logger` instance of the specified name.
   *     The allowed levels are `TRACE`, `DEBUG`, `INFO`, `WARN`, `ERROR`,
   *     and `NONE`. Lowercase letters are also allowed.
   */
  static setLoggerLevel(name, level) {
    level = upperCaseString(level);
    checkLoggingLevel(level);
    __levelMap.set(name, level);
    const logger = __loggerMap.get(name);
    if (logger !== undefined) {
      logger.setLevel(level);
    }
  }

  /**
   * Gets the default logging level.
   *
   * The default logging level is used to construct a new `Logger` instance if
   * the logging level of the new instance is not specified.
   *
   * @return {string}
   *     The global default logging level.
   * @see Logger.setDefaultLevel
   * @see Logger.setAllLevels
   * @see Logger.resetAllLevels
   */
  static getDefaultLevel() {
    return __defaultLevel;
  }

  /**
   * Sets the default logging level.
   *
   * The default logging level is used to construct a new `Logger` instance if
   * the logging level of the new instance is not specified.
   *
   * @param {string} level
   *     The new default logging level. The allowed levels are `TRACE`, `DEBUG`,
   *     `INFO`, `WARN`, `ERROR`, and `NONE`. Lowercase letters are also allowed.
   * @see Logger.getDefaultLevel
   * @see Logger.setAllLevels
   * @see Logger.resetAllLevels
   */
  static setDefaultLevel(level) {
    level = upperCaseString(level);
    checkLoggingLevel(level);
    __defaultLevel = level;
  }

  /**
   * Resets the default logging level to the factory value.
   *
   * The default logging level is used to construct a new `Logger` instance if
   * the logging level of the new instance is not specified.
   */
  static resetDefaultLevel() {
    __defaultLevel = FACTORY_DEFAULT_LEVEL;
  }

  /**
   * Sets the logging level of all existing `Logger` instants.
   *
   * @param {string} level
   *    The new logging level of all existing `Logger` instants. The allowed
   *    levels are `TRACE`, `DEBUG`, `INFO`, `WARN`, `ERROR`, and `NONE`.
   *    Lowercase letters are also allowed.
   * @see Logger.getDefaultLevel
   * @see Logger.setDefaultLevel
   * @see Logger.resetAllLevels
   */
  static setAllLevels(level) {
    level = upperCaseString(level);
    checkLoggingLevel(level);
    for (const logger of __loggerMap.values()) {
      logger.setLevel(level);
    }
  }

  /**
   * Sets the logging level of all `Logger` instants to the default logging level.
   *
   * @see Logger.getDefaultLevel
   * @see Logger.setDefaultLevel
   * @see Logger.setAllLevels
   */
  static resetAllLevels() {
    Logger.setAllLevels(__defaultLevel);
  }

  /**
   * Gets the default logging appender.
   *
   * The default logging appender is used to construct a new `Logger` instance
   * if the logging appender of the new instance is not specified.
   *
   * @return {Object}
   *     The default logging appender.
   * @see Logger.setDefaultAppender
   * @see Logger.setAllAppenders
   * @see Logger.resetAllAppenders
   */
  static getDefaultAppender() {
    return __defaultAppender;
  }

  /**
   * Sets the default logging appender.
   *
   * The default logging appender is used to construct a new `Logger` instance
   * if the logging appender of the new instance is not specified.
   *
   * @param {object} appender
   *     The new default logging appender.
   * @see Logger.getDefaultAppender
   * @see Logger.setAllAppenders
   * @see Logger.resetAllAppenders
   */
  static setDefaultAppender(appender) {
    checkAppend(appender);
    __defaultAppender = appender;
  }

  /**
   * Resets the default logging appender to the factory value.
   *
   * The default logging appender is used to construct a new `Logger` instance
   * if the logging appender of the new instance is not specified.
   *
   * @see Logger.getDefaultAppender
   */
  static resetDefaultAppender() {
    __defaultAppender = FACTORY_DEFAULT_APPENDER;
  }

  /**
   * Sets the appender of all `Logger` instants.
   *
   * @param {object} appender
   *     The new appender to be set, indicating the content output pipe of the
   *     log. This object must provide `trace`, `debug`, `info`, `warn` and
   *     `error` methods.
   * @see Logger.getDefaultAppender
   * @see Logger.setDefaultAppender
   * @see Logger.resetAllAppenders
   */
  static setAllAppenders(appender) {
    checkAppend(appender);
    for (const logger of __loggerMap.values()) {
      logger.setAppender(appender);
    }
  }

  /**
   * Sets the appender of all `Logger` instants to the default appender.
   *
   * @see Logger.getDefaultAppender
   * @see Logger.setDefaultAppender
   * @see Logger.setAllAppenders
   */
  static resetAllAppenders() {
    Logger.setAllAppenders(__defaultAppender);
  }

  /**
   * Construct a log object.
   *
   * **NOTE**: Do NOT call this constructor directly. Use the static method
   * `Logger.getLogger()` instead.
   *
   * @param {string} name
   *     The optional name of this logger. The default value of this argument
   *     is an empty string.
   * @param {object} appender
   *     Optional, indicating the content output pipe of the log. This object
   *     must provide `trace`, `debug`, `info`, `warn` and `error` methods.
   *     The default value of this argument is `Logger.getDefaultAppender()`.
   * @param {string} level
   *     Optional, indicating the log level of this object. The default value
   *     of this argument is `Logger.getDefaultLevel()`.
   * @see Logger.getLogger
   */
  constructor(name, appender, level) {
    if (!__isInternalConstructing) {
      throw new Error('The `Logger` instance can only be constructed by the '
          + 'static method `Logger.getLogger()`.');
    }
    if (appender === undefined) {
      appender = __defaultAppender;
    } else {
      checkAppend(appender);
    }
    if (level === undefined) {
      level = __levelMap.get(name) ?? __defaultLevel;
    } else {
      level = upperCaseString(level);
      checkLoggingLevel(level);
    }
    this._name = name;
    this._level = level;
    this._appender = appender;
    this._bindLoggingMethods(level, appender);
    __levelMap.set(name, level);
  }

  /**
   * Get the name of this logger.
   *
   * @returns {string}
   *     The name of this logger.
   */
  getName() {
    return this._name;
  }

  /**
   * Get the appender of this logger.
   *
   * @return {object}
   *     The appender of this logger.
   */
  getAppender() {
    return this._appender;
  }

  /**
   * Set up a new Appender.
   *
   * @param {object} appender
   *     The new Appender serves as the content output pipeline of the log.
   *     This object must provide `trace`, `debug`, `info`, `warn` and `error`
   *     methods.
   */
  setAppender(appender) {
    checkAppend(appender);
    this._bindLoggingMethods(this._level, appender);
    this._appender = appender;
  }

  /**
   * Get the logging level of this logger.
   *
   * @return {string}
   *     The logging level of this logger. Possible return values are `TRACE`,
   *     `DEBUG`, `INFO`, `WARN`, `ERROR`, and `NONE`.
   */
  getLevel() {
    return this._level;
  }

  /**
   * Set the logging level of this logger.
   *
   * @param {string} level
   *     The new logging level. The allowed levels are `TRACE`, `DEBUG`, `INFO`,
   *     `WARN`, `ERROR`, and `NONE`. Lowercase letters are also allowed.
   */
  setLevel(level) {
    level = upperCaseString(level);
    checkLoggingLevel(level);
    this._bindLoggingMethods(level, this._appender);
    this._level = level;
  }

  /**
   * Disable this logging object.
   */
  disable() {
    this._bindLoggingMethods('NONE', this._appender);
  }

  /**
   * Enable this logging object.
   */
  enable() {
    this._bindLoggingMethods(this._level, this._appender);
  }

  /**
   * Enable or disable this log object.
   *
   * @param {boolean} enabled
   *    Whether to enable this log object.
   */
  setEnabled(enabled) {
    if (enabled) {
      this.enable();
    } else {
      this.disable();
    }
  }

  /**
   * Rebinds all logging implementation methods to the corresponding logging
   * methods of the appender.
   *
   * @param {string} level
   *     The target logging level. All logging methods belows this target logging
   *     level will be bind to a no-op function, while all logging methods above
   *     or equal to this target logging level will be bind to the corresponding
   *     logging methods of the appender. This argument should be a valid
   *     logging level. The function do not check the validity of this argument.
   * @param {object} appender
   *     The appender whose logging methods will be bound to the corresponding
   *     logging methods of this logger. This argument should be a valid appender.
   *     The function do not check the validity of this argument.
   * @private
   */
  _bindLoggingMethods(level, appender) {
    const target = LOGGING_LEVELS[level];
    for (const level in LOGGING_LEVELS) {
      // NOTE: do NOT use Object.hasOwn() because it has a lot of compatibility problems
      if (Object.prototype.hasOwnProperty.call(LOGGING_LEVELS, level) && (level !== 'NONE')) {
        const m = level.toLowerCase();
        if (LOGGING_LEVELS[level] < target) {
          // binds the private logging method of this object to no-op
          this[m] = NOOP;
        } else {
          // binds the private logging method of this object to the
          // corresponding logging method of this.appender.
          //
          // We use the `Function.prototype.bind` to preserve the actual source
          // code location where the logging method is called.
          // See: https://stackoverflow.com/questions/13815640/a-proper-wrapper-for-console-log-with-correct-line-number
          //
          // Another way to preserve the correct source code location of calling
          // Logger's logging methods is to use the stack trace of the Error
          // object. But it's too heavy and significantly affects the performance.
          // See: https://stackoverflow.com/questions/57436034/wrap-consol-log-with-bind-to-keep-caller-context
          //      https://github.com/MrToph/stacklogger/
          //      https://github.com/baryon/tracer
          //
          const prefix = this._getPrefix(level);
          this[m] = Function.prototype.bind.call(appender[m], appender, prefix);
          // this[m] = Function.prototype.bind.call(this._fixFirstArguments, this, level, appender[m], appender);
        }
      }
    }
  }

  _getPrefix(level) {
    let prefix = `[${level}] `;
    if (this._name) {
      prefix += `${this._name} - `;
    }
    // Note that we add a string substitution pattern '%s' to the end of
    // the prefix, since according to the specification of the `console`,
    // the string substitution is taken on the first argument recursively.
    // See: https://stackoverflow.com/questions/75160241/what-order-does-console-log-with-multiple-arguments-and-multiple-s-substitu#answer-75167070
    //      https://console.spec.whatwg.org/#logger
    //      https://console.spec.whatwg.org/#formatter
    //
    // But the `console` object of the Node.js does not support the recursive
    // string substitution.
    // See: https://nodejs.org/api/console.html#console_console_log_data_args
    //  and https://nodejs.org/api/util.html#utilformatformat-args
    prefix += '%s';
    return prefix;
  }

  // _fixFirstArguments(level, method, appender, arg) {
  //   const prefix = this._getPrefix(level);
  //   if (arg === 'string') {
  //     return Function.prototype.bind.call(method, appender, prefix + arg);
  //   } else {
  //     return Function.prototype.bind.call(method, appender, prefix, arg);
  //   }
  // }

  /**
   * Logs a message in the specified logging level.
   *
   * @param {string} level
   *     the logging level.
   * @param {string} message
   *     the message or message template, which may contain zero or more
   *     substitution patterns, e.g., '%o', '%s', '%d', '%f', ..., etc.
   * @param {array} args
   *     the array of arguments used to format the message.
   */
  log(level, message, ...args) {
    const levelName = upperCaseString(level);
    if ((LOGGING_LEVELS[levelName] !== undefined)
        && (LOGGING_LEVELS[levelName] >= LOGGING_LEVELS[this._level])) {
      const method = levelName.toLowerCase();
      this[method](message, ...args);
    }
  }

  /**
   * Logs a message in the `TRACE` level.
   *
   * @param {string} message
   *     the message or message template, which may contain zero or more
   *     substitution patterns, e.g., '%o', '%s', '%d', '%f', ..., etc.
   * @param {array} args
   *     the array of arguments used to format the message.
   * @private
   */
  // eslint-disable-next-line no-unused-vars
  trace(message, ...args) {}

  /**
   * Logs a message in the `DEBUG` level.
   *
   * @param {string} message
   *     the message or message template, which may contain zero or more
   *     substitution patterns, e.g., '%o', '%s', '%d', '%f', ..., etc.
   * @param {array} args
   *     the array of arguments used to format the message.
   * @private
   */
  // eslint-disable-next-line no-unused-vars
  debug(message, ...args) {}

  /**
   * Logs a message in the `INFO` level.
   *
   * @param {string} message
   *     the message or message template, which may contain zero or more
   *     substitution patterns, e.g., '%o', '%s', '%d', '%f', ..., etc.
   * @param {array} args
   *     the array of arguments used to format the message.
   * @private
   */
  // eslint-disable-next-line no-unused-vars
  info(message, ...args) {}

  /**
   * Logs a message in the `WARN` level.
   *
   * @param {string} message
   *     the message or message template, which may contain zero or more
   *     substitution patterns, e.g., '%o', '%s', '%d', '%f', ..., etc.
   * @param {array} args
   *     the array of arguments used to format the message.
   * @private
   */
  // eslint-disable-next-line no-unused-vars
  warn(message, ...args) {}

  /**
   * Logs a message in the `ERROR` level.
   *
   * @param {string} message
   *     the message or message template, which may contain zero or more
   *     substitution patterns, e.g., '%o', '%s', '%d', '%f', ..., etc.
   * @param {array} args
   *     the array of arguments used to format the message.
   * @private
   */
  // eslint-disable-next-line no-unused-vars
  error(message, ...args) {}
}

export default Logger;
