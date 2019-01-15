module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        modules: false
      }
    ],
    '@babel/preset-react'
  ],
  env: {
    build: {
      plugins: ['external-helpers']
    },
    test: {
      presets: [
        [
          '@babel/preset-env',
          {
            modules: 'commonjs',
            debug: false
          }
        ],
        '@babel/preset-react'
      ]
    }
  }
};
