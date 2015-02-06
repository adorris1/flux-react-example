/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var path = require('path');
var assign = require('object-assign');

var assetsJsonFile = './assets.json';
var distbase = 'dist';
var publicbase = '/public';

var assetsConfig = {
  assets: function() {
    return require(assetsJsonFile).assets;
  }
};

/**
 * Prepends a path to object values.
 * Returns a new object result.
 */
function prependPathToObject(fromObj, prePath) {
  return Object.keys(fromObj).reduce(function(obj, key) {
    var fromValue = fromObj[key];
    if (typeof fromValue === 'string') {
      obj[key] = path.join(prePath, fromValue);
    } else {
      obj[key] = fromValue;
    }
    return obj;
  }, {});
}

/**
 * Directories and files that are in src, distribution, and web
 */
var commonDirs = {
  images: 'images',  
  styles: 'styles',
  fonts: 'fonts'
};
var commonFiles = {
  four04: '404.html',
  five03: '503.html',
  favicon: path.join(commonDirs.images, 'favicon.ico'),  
  robots: 'robots.txt',
  sitemap: 'sitemap.xml'
};

/**
 * Directories and files that are in both dist and web
 */
var outputDirs = {
  scripts: 'scripts'
};
var outputFiles = {
  css: path.join(commonDirs.styles, 'index.css')
};

/**
 * Source only dirs and files
 */
var srcDirs = {
  components: 'components',
  config: 'config'  
};
var srcFiles = {
  assetsJson: path.join(srcDirs.config, path.basename(__dirname), assetsJsonFile)  
};

/**
 * Settings to override by environment
 */
var overrides = {
  production: {
    dist: {
      baseDir: path.join(distbase, 'release')
    },
    loggerFormat: 'tiny',
    web: {
      baseDir: publicbase,
      assetAge: 31556926000,
      ssl: false
    }
  }
};

/**
 * The exported settings config
 */
var config = {
  dist: {
    baseDir: path.join(distbase, 'debug')
  },
  src: {
    baseDir: '.'
  },
  web: {
    baseDir: publicbase,
    assetAge: 0,
    ssl: false
  },

  // unmovable project directories
  distbase: distbase,
  reports: 'reports',
  vendor: 'vendor',

  loggerFormat: 'dev'
};

// Environment overrides
assign(config, overrides[process.env.NODE_ENV || 'development']);

// Assemble config.src
assign(
  config.src,
  prependPathToObject(commonDirs, config.src.baseDir),
  prependPathToObject(commonFiles, config.src.baseDir),
  prependPathToObject(srcDirs, config.src.baseDir),
  prependPathToObject(srcFiles, config.src.baseDir),
  assetsConfig
);

// Assemble config.dist and config.web
[config.dist, config.web].forEach(function(config) {
  assign(
    config,
    prependPathToObject(commonDirs, config.baseDir),
    prependPathToObject(commonFiles, config.baseDir),
    prependPathToObject(outputDirs, config.baseDir),
    prependPathToObject(outputFiles, config.baseDir)
  );
});

module.exports = config;