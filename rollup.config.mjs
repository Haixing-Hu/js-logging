////////////////////////////////////////////////////////////////////////////////
//
//    Copyright (c) 2022 - 2023.
//    Haixing Hu, Qubit Co. Ltd.
//
//    All rights reserved.
//
////////////////////////////////////////////////////////////////////////////////
import rollupBuilder from '@haixing_hu/rollup-builder';

export default rollupBuilder('Logging', import.meta.url, {
  debug: true,
  formats: ['cjs', 'esm', 'iife'],
  exports: 'mixed',
});
