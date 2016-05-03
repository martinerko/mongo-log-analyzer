/*!
 * mongo-log-analyzer
 * Copyright(c) 2016 martinerko <martinerko@gmail.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var assert = require('assert');
var lib = require('..');
var path = require('path');

/**
 * Constants
 */

var LOG_FILE = path.resolve(__dirname, './data/mongod.log');

describe('miner module for queries', function() {
  this.timeout(30000);

  it('should find 18 query entries in given log file', function(done) {
    lib.miner.query(LOG_FILE, function(err, data) {
      assert.equal(18, data.length);
      done();
    });
  });
});
