////////////////////////////////////////////////////////////////////////////////
//
//    Copyright (c) 2022 - 2024.
//    Haixing Hu, Qubit Co. Ltd.
//
//    All rights reserved.
//
////////////////////////////////////////////////////////////////////////////////
import bindWithProxy from '../../src/impl/bind-with-proxy';
import CustomizedAppender from '../helper/customized-appender';

describe('测试 bindWithProxy', () => {
  it('应该使用Proxy绑定日志方法', () => {
    const logger = {};
    const appender = new CustomizedAppender();
    const method = 'debug';
    const level = 'DEBUG';

    bindWithProxy(logger, method, level, appender);

    expect(typeof logger.debug).toBe('function');

    // 调用绑定的方法
    logger.debug('test message');

    // 验证appender的debug方法被调用，并且参数包含了日志前缀
    expect(appender.logs.length).toBe(1);
    expect(appender.logs[0].type).toBe('DEBUG');
    expect(appender.logs[0].args[0]).toContain('[DEBUG]');
    expect(appender.logs[0].args[0]).toContain('test message');
  });

  it('应该处理无参数调用', () => {
    const logger = {};
    const appender = new CustomizedAppender();
    const method = 'trace';
    const level = 'TRACE';

    bindWithProxy(logger, method, level, appender);

    // 调用绑定的方法，没有参数
    logger.trace();

    // 验证appender的trace方法被调用，只有前缀
    expect(appender.logs.length).toBe(1);
    expect(appender.logs[0].type).toBe('TRACE');
    expect(appender.logs[0].args[0]).toContain('[TRACE]');
  });

  it('应该处理第一个参数是对象的情况', () => {
    const logger = {};
    const appender = new CustomizedAppender();
    const method = 'info';
    const level = 'INFO';

    bindWithProxy(logger, method, level, appender);

    // 调用绑定的方法，第一个参数是对象
    const obj = { message: 'test object' };
    logger.info(obj);

    // 验证appender的info方法被调用
    expect(appender.logs.length).toBe(1);
    expect(appender.logs[0].type).toBe('INFO');
    expect(appender.logs[0].args[0]).toContain('[INFO]');
    expect(appender.logs[0].args[1]).toEqual(obj);
  });
});
