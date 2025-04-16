////////////////////////////////////////////////////////////////////////////////
//
//    Copyright (c) 2022 - 2024.
//    Haixing Hu, Qubit Co. Ltd.
//
//    All rights reserved.
//
////////////////////////////////////////////////////////////////////////////////
import fixFirstArgument from '../../src/impl/fix-first-argument';

describe('测试 fixFirstArgument', () => {
  it('应该正确处理空参数', () => {
    const prefix = '[PREFIX] ';
    const args = [];
    const result = fixFirstArgument(prefix, args);
    expect(result).toEqual([prefix]);
  });

  it('应该正确处理第一个参数为字符串的情况', () => {
    const prefix = '[PREFIX] ';
    const args = ['message', 1, 2];
    const result = fixFirstArgument(prefix, args);
    expect(result).toEqual(['[PREFIX] message', 1, 2]);
    expect(args[0]).toEqual('[PREFIX] message'); // 验证原始参数被修改
  });

  it('应该正确处理第一个参数不是字符串的情况', () => {
    const prefix = '[PREFIX] ';
    const args = [{ key: 'value' }, 1, 2];
    const result = fixFirstArgument(prefix, args);
    expect(result).toEqual(['[PREFIX] ', { key: 'value' }, 1, 2]);
  });
});
