////////////////////////////////////////////////////////////////////////////////
//
//    Copyright (c) 2022 - 2024.
//    Haixing Hu, Qubit Co. Ltd.
//
//    All rights reserved.
//
////////////////////////////////////////////////////////////////////////////////
import bindLoggingMethods from '../../src/impl/bind-logging-methods';
import getBrowserEngine from '../../src/impl/get-browser-engine';
import CustomizedAppender from '../helper/customized-appender';
import LOGGING_LEVELS from '../../src/impl/logging-levels';

// 模拟getBrowserEngine函数
jest.mock('../../src/impl/get-browser-engine');

describe('测试 bindLoggingMethods', () => {
  beforeEach(() => {
    // 重置所有的模拟函数
    jest.clearAllMocks();
  });

  it('应该根据日志级别绑定方法', () => {
    const logger = {};
    const appender = new CustomizedAppender();
    const level = 'INFO';

    // 模拟getBrowserEngine返回Blink
    getBrowserEngine.mockReturnValue('Blink');

    bindLoggingMethods(logger, level, appender);

    // 验证低于INFO级别的方法被绑定为NOOP
    expect(typeof logger.trace).toBe('function');
    expect(typeof logger.debug).toBe('function');
    logger.trace('test trace');
    logger.debug('test debug');
    expect(appender.logs.length).toBe(0); // 不会调用appender

    // 验证大于等于INFO级别的方法被正确绑定
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.warn).toBe('function');
    expect(typeof logger.error).toBe('function');
    logger.info('test info');
    logger.warn('test warn');
    logger.error('test error');
    expect(appender.logs.length).toBe(3); // 调用了appender
  });

  it('应该在WebKit引擎上使用bindWithArrowFunction', () => {
    const logger = {};
    const appender = new CustomizedAppender();
    const level = 'ERROR';

    // 模拟getBrowserEngine返回WebKit
    getBrowserEngine.mockReturnValue('WebKit');

    bindLoggingMethods(logger, level, appender);

    // 验证绑定了error方法
    expect(typeof logger.error).toBe('function');
    logger.error('test error');
    expect(appender.logs.length).toBe(1);
    expect(appender.logs[0].type).toBe('ERROR');
    expect(appender.logs[0].args[0]).toContain('[ERROR]');
    expect(appender.logs[0].args[0]).toContain('test error');
  });

  it('应该在Gecko引擎上使用bindWithoutPrefix', () => {
    const logger = {};
    const appender = new CustomizedAppender();
    const level = 'ERROR';

    // 模拟getBrowserEngine返回Gecko
    getBrowserEngine.mockReturnValue('Gecko');

    bindLoggingMethods(logger, level, appender);

    // 验证绑定了error方法
    expect(typeof logger.error).toBe('function');
    logger.error('test error');
    expect(appender.logs.length).toBe(1);
    expect(appender.logs[0].type).toBe('ERROR');
    expect(appender.logs[0].args[0]).toBe('test error');
  });

  it('应该在Trident引擎上使用bindWithoutPrefix', () => {
    const logger = {};
    const appender = new CustomizedAppender();
    const level = 'ERROR';

    // 模拟getBrowserEngine返回Trident
    getBrowserEngine.mockReturnValue('Trident');

    bindLoggingMethods(logger, level, appender);

    // 验证绑定了error方法
    expect(typeof logger.error).toBe('function');
    logger.error('test error');
    expect(appender.logs.length).toBe(1);
    expect(appender.logs[0].type).toBe('ERROR');
    expect(appender.logs[0].args[0]).toBe('test error');
  });

  it('应该在Presto引擎上使用bindWithoutPrefix', () => {
    const logger = {};
    const appender = new CustomizedAppender();
    const level = 'ERROR';

    // 模拟getBrowserEngine返回Presto
    getBrowserEngine.mockReturnValue('Presto');

    bindLoggingMethods(logger, level, appender);

    // 验证绑定了error方法
    expect(typeof logger.error).toBe('function');
    logger.error('test error');
    expect(appender.logs.length).toBe(1);
    expect(appender.logs[0].type).toBe('ERROR');
    expect(appender.logs[0].args[0]).toBe('test error');
  });

  it('应该在未知引擎上使用bindWithoutPrefix', () => {
    const logger = {};
    const appender = new CustomizedAppender();
    const level = 'ERROR';

    // 模拟getBrowserEngine返回Unknown
    getBrowserEngine.mockReturnValue('Unknown');

    bindLoggingMethods(logger, level, appender);

    // 验证绑定了error方法
    expect(typeof logger.error).toBe('function');
    logger.error('test error');
    expect(appender.logs.length).toBe(1);
    expect(appender.logs[0].type).toBe('ERROR');
    expect(appender.logs[0].args[0]).toBe('test error');
  });

  it('应该跳过NONE日志级别', () => {
    const logger = {};
    const appender = new CustomizedAppender();
    const level = 'ERROR';

    // 手动添加一个NONE级别来测试
    const originalNone = LOGGING_LEVELS.NONE;
    LOGGING_LEVELS.NONE = Number.MAX_SAFE_INTEGER;

    try {
      // 模拟getBrowserEngine返回Blink
      getBrowserEngine.mockReturnValue('Blink');

      bindLoggingMethods(logger, level, appender);

      // 验证没有绑定none方法
      expect(logger.none).toBeUndefined();
    } finally {
      // 恢复原始值
      LOGGING_LEVELS.NONE = originalNone;
    }
  });
});
