////////////////////////////////////////////////////////////////////////////////
//
//    Copyright (c) 2022 - 2024.
//    Haixing Hu, Qubit Co. Ltd.
//
//    All rights reserved.
//
////////////////////////////////////////////////////////////////////////////////
import { Logger } from '../src';
import CustomizedAppender from './helper/customized-appender';
import { beforeEachHook, afterEachHook } from './helper/jest-hooks';

describe('测试 Logger 的日志方法', () => {
  beforeEach(() => {
    beforeEachHook();
    Logger.reset();
  });

  afterEach(() => {
    afterEachHook();
  });

  /**
   * 这个测试是为了确保 Logger 类中的 5 个空日志方法被正确覆盖
   * 这些方法在 logger.js 中仅仅是空实现：
   * - trace(message, ...args) {}
   * - debug(message, ...args) {}
   * - info(message, ...args) {}
   * - warn(message, ...args) {}
   * - error(message, ...args) {}
   *
   * 在运行时，这些方法会被真正的实现绑定。
   * 这里我们只测试这些方法是否被正确绑定，能够被调用，
   * 不测试具体的日志格式，因为这依赖于具体的绑定机制。
   */
  describe('直接访问 Logger 类中的日志方法', () => {
    it('所有日志方法应该存在于 Logger.prototype', () => {
      expect(typeof Logger.prototype.trace).toBe('function');
      expect(typeof Logger.prototype.debug).toBe('function');
      expect(typeof Logger.prototype.info).toBe('function');
      expect(typeof Logger.prototype.warn).toBe('function');
      expect(typeof Logger.prototype.error).toBe('function');
    });

    it('debug 方法应该可以被调用而不抛出异常', () => {
      const appender = new CustomizedAppender();
      const logger = Logger.getLogger('TestLogger', { appender, level: 'DEBUG' });

      // 确保 appender 的 logs 数组被清空
      appender.clear();

      // 调用方法
      expect(() => logger.debug('Test debug message')).not.toThrow();

      // 验证 appender 的 debug 方法被调用
      expect(appender.logs.length).toBeGreaterThan(0);
      expect(appender.logs.some((log) => log.type === 'DEBUG')).toBe(true);
    });

    it('info 方法应该可以被调用而不抛出异常', () => {
      const appender = new CustomizedAppender();
      const logger = Logger.getLogger('TestLogger', { appender, level: 'INFO' });

      // 确保 appender 的 logs 数组被清空
      appender.clear();

      // 调用方法
      expect(() => logger.info('Test info message')).not.toThrow();

      // 验证 appender 的 info 方法被调用
      expect(appender.logs.length).toBeGreaterThan(0);
      expect(appender.logs.some((log) => log.type === 'INFO')).toBe(true);
    });

    it('warn 方法应该可以被调用而不抛出异常', () => {
      const appender = new CustomizedAppender();
      const logger = Logger.getLogger('TestLogger', { appender, level: 'WARN' });

      // 确保 appender 的 logs 数组被清空
      appender.clear();

      // 调用方法
      expect(() => logger.warn('Test warn message')).not.toThrow();

      // 验证 appender 的 warn 方法被调用
      expect(appender.logs.length).toBeGreaterThan(0);
      expect(appender.logs.some((log) => log.type === 'WARN')).toBe(true);
    });

    it('error 方法应该可以被调用而不抛出异常', () => {
      const appender = new CustomizedAppender();
      const logger = Logger.getLogger('TestLogger', { appender, level: 'ERROR' });

      // 确保 appender 的 logs 数组被清空
      appender.clear();

      // 调用方法
      expect(() => logger.error('Test error message')).not.toThrow();

      // 验证 appender 的 error 方法被调用
      expect(appender.logs.length).toBeGreaterThan(0);
      expect(appender.logs.some((log) => log.type === 'ERROR')).toBe(true);
    });

    it('trace 方法应该可以被调用而不抛出异常', () => {
      const appender = new CustomizedAppender();
      const logger = Logger.getLogger('TestLogger', { appender, level: 'TRACE' });

      // 确保 appender 的 logs 数组被清空
      appender.clear();

      // 调用方法
      expect(() => logger.trace('Test trace message')).not.toThrow();

      // 验证 appender 的 trace 方法被调用
      // 注意：trace 级别是最低级别，应该始终被记录
      expect(appender.logs.length).toBeGreaterThan(0);
      expect(appender.logs.some((log) => log.type === 'TRACE')).toBe(true);
    });
  });
});
