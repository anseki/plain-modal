/* eslint-env node, es6 */

'use strict';

const
  BASE_NAME = 'plain-modal',
  OBJECT_NAME = 'PlainModal',

  webpack = require('webpack'),
  path = require('path'),
  PKG = require('./package'),

  // Get paths for compass and copy to ENV for `webpack.config.rules.js`
  RULES = ((SASS_PATHS) => { process.env.SASS_PATHS = SASS_PATHS.join('\n'); })([
    (() => {
      const lib = require.resolve('compass-mixins');
      if (!/[/\\]compass-mixins[/\\]/.test(lib)) { throw new Error('Not found `compass-mixins`'); }
      return path.dirname(lib);
    })(),
    path.resolve(__dirname, '../../_common')
  ]) ||
    require('./webpack.config.rules.js').concat([ // Join `webpack.config.rules.js` files
      'cssprefix',
      'anim-event',
      'm-class-list',
      'timed-transition',
      ['plain-overlay', {EDITION: 'limit', SYNC: 'yes'}],
      ['plain-draggable', {EDITION: 'limit'}]
    ].reduce((rules, packageName) => {
      if (Array.isArray(packageName)) { // [packageName, {env1: value1, ...}]
        // Force parameters
        const orgEnv = {};
        Object.keys(packageName[1]).forEach(envName => {
          orgEnv[envName] = process.env[envName];
          process.env[envName] = packageName[1][envName];
        });
        rules = rules.concat(require(`./node_modules/${packageName[0]}/webpack.config.rules.js`));
        Object.keys(packageName[1]).forEach(envName => { process.env[envName] = orgEnv[envName]; });
        return rules;
      } else {
        return rules.concat(require(`./node_modules/${packageName}/webpack.config.rules.js`));
      }
    }, [])),

  BUILD = process.env.NODE_ENV === 'production',
  LIMIT = process.env.EDITION === 'limit',

  ENTRY_PATH = path.resolve(__dirname, 'src', `${BASE_NAME}.js`),
  BUILD_PATH = BUILD ? __dirname : path.resolve(__dirname, 'test'),
  BUILD_FILE = `${BASE_NAME}${LIMIT ? '-limit' : ''}${BUILD ? '.min' : ''}.js`;

module.exports = {
  entry: ENTRY_PATH,
  output: {
    path: BUILD_PATH,
    filename: BUILD_FILE,
    library: OBJECT_NAME,
    libraryTarget: 'var'
  },
  resolve: {mainFields: ['jsnext:main', 'browser', 'module', 'main']},
  module: {rules: RULES},
  devtool: BUILD ? false : 'source-map',
  plugins: BUILD ? [
    new webpack.optimize.UglifyJsPlugin({compress: {warnings: true}}),
    new webpack.BannerPlugin(
      `${PKG.title || PKG.name} v${PKG.version} (c) ${PKG.author.name} ${PKG.homepage}`)
  ] : []
};
