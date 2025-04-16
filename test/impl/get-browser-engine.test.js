////////////////////////////////////////////////////////////////////////////////
//
//    Copyright (c) 2022 - 2024.
//    Haixing Hu, Qubit Co. Ltd.
//
//    All rights reserved.
//
////////////////////////////////////////////////////////////////////////////////
import getBrowserEngine from '../../src/impl/get-browser-engine';

describe('测试 getBrowserEngine', () => {
  let originalUserAgent;

  beforeEach(() => {
    originalUserAgent = window.navigator.userAgent;

    // 使用Object.defineProperty模拟不同的userAgent
    Object.defineProperty(window.navigator, 'userAgent', {
      configurable: true,
      get: jest.fn(),
    });
  });

  afterEach(() => {
    // 恢复原始的userAgent
    Object.defineProperty(window.navigator, 'userAgent', {
      configurable: true,
      get: () => originalUserAgent,
    });
  });

  it('应该识别Gecko引擎(Firefox)', () => {
    Object.defineProperty(window.navigator, 'userAgent', {
      get: () => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:91.0) Gecko/20100101 Firefox/91.0',
    });
    expect(getBrowserEngine()).toBe('Gecko');
  });

  it('应该识别Blink引擎(Chrome)', () => {
    Object.defineProperty(window.navigator, 'userAgent', {
      get: () => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    });
    expect(getBrowserEngine()).toBe('Blink');
  });

  it('应该识别Blink引擎(Edge)', () => {
    Object.defineProperty(window.navigator, 'userAgent', {
      get: () => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59',
    });
    expect(getBrowserEngine()).toBe('Blink');
  });

  it('应该识别WebKit引擎(Safari)', () => {
    Object.defineProperty(window.navigator, 'userAgent', {
      get: () => 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
    });
    expect(getBrowserEngine()).toBe('WebKit');
  });

  it('应该识别Trident引擎(IE)', () => {
    Object.defineProperty(window.navigator, 'userAgent', {
      get: () => 'Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; rv:11.0) like Gecko',
    });
    expect(getBrowserEngine()).toBe('Trident');
  });

  it('应该识别Presto引擎(旧版Opera)', () => {
    Object.defineProperty(window.navigator, 'userAgent', {
      get: () => 'Opera/9.80 (Windows NT 6.1; WOW64) Presto/2.12.388 Version/12.18',
    });
    expect(getBrowserEngine()).toBe('Presto');
  });

  it('对于未知引擎应该返回Unknown', () => {
    Object.defineProperty(window.navigator, 'userAgent', {
      get: () => 'SomeUnknownBrowser/1.0',
    });
    expect(getBrowserEngine()).toBe('Unknown');
  });
});
