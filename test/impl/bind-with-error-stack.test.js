////////////////////////////////////////////////////////////////////////////////
//
//    Copyright (c) 2022 - 2024.
//    Haixing Hu, Qubit Co. Ltd.
//
//    All rights reserved.
//
////////////////////////////////////////////////////////////////////////////////
import bindWithErrorStack from '../../src/impl/bind-with-error-stack';
import CustomizedAppender from '../helper/customized-appender';

describe('测试 bindWithErrorStack', () => {
  it('应该绑定带有错误堆栈的日志方法', () => {
    const logger = {};
    const appender = new CustomizedAppender();
    const method = 'info';
    const level = 'INFO';

    bindWithErrorStack(logger, method, level, appender);

    expect(typeof logger.info).toBe('function');

    // 调用绑定的方法
    logger.info('test message');

    // 验证appender的info方法被调用，并且参数包含了日志前缀和错误堆栈
    expect(appender.logs.length).toBe(1);
    expect(appender.logs[0].type).toBe('INFO');
    expect(appender.logs[0].args[0]).toContain('[INFO]');
    expect(appender.logs[0].args[0]).toContain('test message');
    expect(appender.logs[0].args[1]).toContain('('); // 包含堆栈信息
  });

  it('应该能处理无参数调用', () => {
    const logger = {};
    const appender = new CustomizedAppender();
    const method = 'error';
    const level = 'ERROR';

    bindWithErrorStack(logger, method, level, appender);

    // 调用绑定的方法，没有参数
    logger.error();

    // 验证appender的error方法被调用，只有前缀和堆栈信息
    expect(appender.logs.length).toBe(1);
    expect(appender.logs[0].type).toBe('ERROR');
    expect(appender.logs[0].args[0]).toContain('[ERROR]');
    expect(appender.logs[0].args[1]).toContain('('); // 包含堆栈信息
  });

  it('应该能处理第一个参数是对象的情况', () => {
    const logger = {};
    const appender = new CustomizedAppender();
    const method = 'warn';
    const level = 'WARN';

    bindWithErrorStack(logger, method, level, appender);

    // 调用绑定的方法，第一个参数是对象
    const obj = { message: 'test object' };
    logger.warn(obj);

    // 验证appender的warn方法被调用
    expect(appender.logs.length).toBe(1);
    expect(appender.logs[0].type).toBe('WARN');
    expect(appender.logs[0].args[0]).toContain('[WARN]');
    expect(appender.logs[0].args[1]).toEqual(obj);
    expect(appender.logs[0].args[2]).toContain('('); // 包含堆栈信息
  });

  it('应该处理缺少调用栈信息的情况', () => {
    const logger = {};
    const appender = new CustomizedAppender();
    const method = 'debug';
    const level = 'DEBUG';

    // 模拟缺少调用栈的情况
    const originalError = Error;
    global.Error = class MockError {
      constructor() {
        this.stack = 'Error';  // 只有第一行，没有调用栈的第二行
      }
    };

    bindWithErrorStack(logger, method, level, appender);

    // 调用绑定的方法
    logger.debug('test message');

    // 恢复原始的Error
    global.Error = originalError;

    // 验证appender的debug方法被调用，并包含"unknown source"
    expect(appender.logs.length).toBe(1);
    expect(appender.logs[0].type).toBe('DEBUG');
    expect(appender.logs[0].args[0]).toContain('[DEBUG]');
    expect(appender.logs[0].args[0]).toContain('test message');
    expect(appender.logs[0].args[1]).toContain('unknown source');
  });
});
