////////////////////////////////////////////////////////////////////////////////
//
//    Copyright (c) 2022 - 2024.
//    Haixing Hu, Qubit Co. Ltd.
//
//    All rights reserved.
//
////////////////////////////////////////////////////////////////////////////////
import bindWithoutPrefix from '../../src/impl/bind-without-prefix';
import CustomizedAppender from '../helper/customized-appender';

describe('测试 bindWithoutPrefix', () => {
  it('应该绑定不带前缀的日志方法', () => {
    const logger = {};
    const appender = new CustomizedAppender();
    const method = 'warn';
    const level = 'WARN';

    bindWithoutPrefix(logger, method, level, appender);

    expect(typeof logger.warn).toBe('function');

    // 调用绑定的方法
    logger.warn('test message');

    // 验证appender的warn方法被调用，没有添加前缀
    expect(appender.logs.length).toBe(1);
    expect(appender.logs[0].type).toBe('WARN');
    expect(appender.logs[0].args[0]).toBe('test message');
  });

  it('应该正确传递多个参数', () => {
    const logger = {};
    const appender = new CustomizedAppender();
    const method = 'error';
    const level = 'ERROR';

    bindWithoutPrefix(logger, method, level, appender);

    // 调用绑定的方法，传递多个参数
    logger.error('test message', 123, { key: 'value' });

    // 验证appender的error方法被调用，参数原样传递
    expect(appender.logs.length).toBe(1);
    expect(appender.logs[0].type).toBe('ERROR');
    expect(appender.logs[0].args[0]).toBe('test message');
    expect(appender.logs[0].args[1]).toBe(123);
    expect(appender.logs[0].args[2]).toEqual({ key: 'value' });
  });

  it('应该处理无参数调用', () => {
    const logger = {};
    const appender = new CustomizedAppender();
    const method = 'trace';
    const level = 'TRACE';

    bindWithoutPrefix(logger, method, level, appender);

    // 调用绑定的方法，没有参数
    logger.trace();

    // 验证appender的trace方法被调用，没有参数
    expect(appender.logs.length).toBe(1);
    expect(appender.logs[0].type).toBe('TRACE');
    expect(appender.logs[0].args.length).toBe(0);
  });
});
