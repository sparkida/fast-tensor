import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import alias from '@rollup/plugin-alias';
import dts from "rollup-plugin-dts";
import del from 'rollup-plugin-delete';
import terser from '@rollup/plugin-terser';

const PREAMBLE = `/**
 * MIT License
 * 
 * Copyright (c) ${(new Date).getFullYear()} Nick Riley (@sparkida)
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */`;

export default [
  // Browser Build
  {
    input: 'src/ts/index.ts',
    output: [
      {
        file: 'dist/index.esm.js',
        format: 'esm',
        exports: 'named',
        inlineDynamicImports: true,
        sourcemap: true,
      }, {
        file: 'dist/index.cjs',
        format: 'cjs',
        exports: 'named',
        inlineDynamicImports: true,
        sourcemap: true,
      }
    ],
    plugins: [
      resolve({
        browser: true,
      }),
      typescript({
        paths: {
          "@loader": ["src/ts/loaders/browser.ts"]
        }
      }),
      terser({
        keep_classnames: true,
        format: {
          preamble: PREAMBLE,
        }
      })
    ],
  },
  // Node build
  {
    input: 'src/ts/index.ts',
    output: [
      {
        file: 'dist/index.node.esm.js',
        format: 'esm',
        exports: 'named',
        inlineDynamicImports: true,
        sourcemap: true,
      }, {
        file: 'dist/index.node.cjs',
        format: 'cjs',
        exports: 'named',
        inlineDynamicImports: true,
        sourcemap: true,
      }
    ],
    plugins: [
      resolve(),
      typescript({
        paths: {
          "@loader": ["src/ts/loaders/node.ts"]
        }
      }),
      terser({
        keep_classnames: true,
        keep_fnames: true,
        format: {
          preamble: PREAMBLE,
        }
      })
    ],
  },
  // Configuration for bundling .d.ts files
  {
    input: 'dist/index.d.ts',
    output: {
      file: 'dist/index.d.ts',
      banner: PREAMBLE,
      format: 'es',
    },
    plugins: [
      dts(),
      alias({
        entries: [
          { find: './types/WasmModule.d.ts', replacement: 'src/ts/types/WasmModule.d.ts' },
        ],
      }),
      del({
        targets: [
          'dist/*.d.ts',
          'dist/loaders',
        ],
        runOnce: true,
        hook: 'buildEnd' // run at the end of the rollup
      }),
    ],
  },

];

