#!/usr/bin/env node

/*!
 * mongo-log-analyzer
 * Copyright(c) 2016 martinerko <martinerko@gmail.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var help = require('./help');
var argv = require('minimist')(process.argv.slice(2));
var miner = require('../lib/miner');
var stats = require('../lib/stats');

if (argv.h || argv.help) {
  help();
  process.exit(0);
}

if (!argv.queries) {
  help();
  process.exit(1);
}

/**
 * Constants
 */

var HISTOGRAM_RANGES_FOR_QUERIES = require('../lib/stats/query').HISTOGRAM_RANGES;
var INPUT_FILE = process.argv[2];

miner.query(INPUT_FILE, function(err, queries) {
  if (err) {
    console.log(err.message);
    process.exit(1);
  }

  stats.query({
    data: queries,
    histogram: argv.histogram,
    sample: argv.sample
  }, function(err, stats) {
    if (err) {
      console.log(err.message);
      process.exit(1);
    }

    toOutput(stats);
  });
});

function toOutput(data) {
  var compile = require('string-template/compile');
  var HEADER = 'ns\tquery\torderby\tstage\tindex\tcount\tmin (ms)\tmax (ms)\tmean (ms)';
  var ROW = '{ns}\t{query}\t{orderby}\t{stage}\t{index}\t{count}\t{min}\t{max}\t{mean}';

  if (argv.sample) {
    HEADER += '\tsample';
    ROW += '\t{sample}';
  }

  var ROW_TEMPLATE = compile(ROW);

  if (argv.histogram) {
    var HISTOGRAM_HEADER = HISTOGRAM_RANGES_FOR_QUERIES.map(function(limit) {
      return '<= ' + limit + ' (ms) %';
    }).join('\t') + '\trest %';

    process.stdout.write(HEADER + '\t' + HISTOGRAM_HEADER + '\n');

    var HISTOGRAM_ROW = HISTOGRAM_RANGES_FOR_QUERIES.map(function(limit) {
      return '{' + limit + '}';
    }).join('\t') + '\t{rest}';
    var HISTOGRAM_ROW_TEMPLATE = compile(HISTOGRAM_ROW);

    data.forEach(function(item) {
      process.stdout.write(ROW_TEMPLATE(item) + '\t' + HISTOGRAM_ROW_TEMPLATE(item.histogramPercentage) + '\n');
    });
  } else {
    process.stdout.write(HEADER + '\n');

    data.forEach(function(item) {
      process.stdout.write(ROW_TEMPLATE(item) + '\n');
    });
  }
}
