/*!
 * mongo-log-analyzer
 * Copyright(c) 2016 martinerko <martinerko@gmail.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var miner = require("../lib/miner").query;
var stats = require("../lib/stats").query;
var path = require("path");

/**
 * Constants
 */

var FILE = '../test/data/mongod.log';

miner(process.argv[2] || path.join(__dirname, FILE), function(err, queries) {
  if (err) {
    return console.error(err);
  }

  // process found queries and show also histogram and sample query data
  stats({
    data: queries,
    histogram: true, // calculate histogram
    sample: true // show sample query (longest running one)
  }, function(err, data) {
    if (err) {
      return console.error(err);
    }
    data.forEach(console.log);
  });
});
