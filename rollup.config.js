import typescript from '@rollup/plugin-typescript'
import copy from 'rollup-plugin-copy'

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.js',
      format: 'cjs',
      sourcemap: true,
      exports: 'named'
    },
    {
      file: 'dist/index.esm.js',
      format: 'esm',
      sourcemap: true
    }
  ],
  external: ['vue', 'h3', /\.vue$/],
  plugins: [
    typescript({
      tsconfig: './tsconfig.json',
      declaration: true,
      declarationDir: 'dist',
      rootDir: 'src',
      exclude: ['**/*.vue']
    }),
    copy({
      targets: [
        { src: 'src/components/*.vue', dest: 'dist/components' }
      ],
      hook: 'writeBundle'
    })
  ]
}

