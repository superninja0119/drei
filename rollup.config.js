import path from 'path'
import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'
import json from 'rollup-plugin-json'
import { sizeSnapshot } from 'rollup-plugin-size-snapshot'
import glslify from 'rollup-plugin-glslify'
import multiInput from 'rollup-plugin-multi-input'

const root = process.platform === 'win32' ? path.resolve('/') : '/'
const external = (id) => !id.startsWith('.') && !id.startsWith(root)
const extensions = ['.js', '.jsx', '.ts', '.tsx', '.json']

const getBabelOptions = ({ useESModules }, targets) => ({
  babelrc: false,
  extensions,
  exclude: '**/node_modules/**',
  runtimeHelpers: true,
  presets: [
    ['@babel/preset-env', { loose: true, modules: false, targets }],
    '@babel/preset-react',
    '@babel/preset-typescript',
  ],
  plugins: [
    '@babel/plugin-proposal-class-properties',
    ['transform-react-remove-prop-types', { removeImport: true }],
    ['@babel/transform-runtime', { regenerator: false, useESModules }],
  ],
})

export default [
  {
    input: ['src/*.tsx', '!src/index.tsx'],
    output: { dir: `dist`, format: 'esm' },
    external,
    plugins: [
      multiInput(),
      json(),
      glslify(),
      babel(getBabelOptions({ useESModules: true }, '>1%, not dead, not ie 11, not op_mini all')),
      resolve({ extensions }),
    ],
  },
  {
    input: `./src/index.tsx`,
    output: { dir: `dist`, format: 'esm' },
    external,
    plugins: [
      json(),
      glslify(),
      babel(getBabelOptions({ useESModules: true }, '>1%, not dead, not ie 11, not op_mini all')),
      sizeSnapshot(),
      resolve({ extensions }),
    ],
    preserveModules: true,
  },
  {
    input: ['src/*.tsx', '!src/index.tsx'],
    output: { dir: `dist`, format: 'cjs' },
    external,
    plugins: [
      multiInput({
        transformOutputPath: (output) => path.basename(output, '.tsx') + '.cjs.js',
      }),
      json(),
      glslify(),
      babel(getBabelOptions({ useESModules: false })),
      resolve({ extensions }),
    ],
  },
  {
    input: `./src/index.tsx`,
    output: { file: `dist/index.cjs.js`, format: 'cjs' },
    external,
    plugins: [
      json(),
      glslify(),
      babel(getBabelOptions({ useESModules: false })),
      sizeSnapshot(),
      resolve({ extensions }),
    ],
  },
]
