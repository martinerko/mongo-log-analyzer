/*!
 * mongo-log-analyzer
 * Copyright(c) 2016 martinerko <martinerko@gmail.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var debug = require('debug')('mongo-log-analyzer:miner');
var es = require('event-stream');
var fs = require('fs');
var parser = require('./parser');


/**
 * Universal mining function which reads the mongod file
 * using provided parsing function.
 *
 * @param  {Function} parserFn  parsing function to be used for mining
 * @param  {String} file        source file to be parsed
 * @param  {Function} callback  callback to be executed
 * @api private
 */

function miner(parserFn, file, callback) {
  debug("processing " + file);

  try {
    fs.statSync(file).isFile();
  } catch (e) {
    callback(new Error('Can\'t open ' + file + ' file.'));
    process.exit(1);
  }

  var buffer = [];
  fs.createReadStream(file)
    .pipe(es.split())
    .pipe(es.mapSync(parserFn))
    .on('data', function(data) {
      data && buffer.push(data);
    })
    .on('error', function(e) {
      debug('error', e);
    })
    .on('end', function() {
      callback(null, buffer);
      debug('done');
    });
}

/**
 * API
 *
 * @param  {String} file        source file to be parsed
 * @param  {Function} callback  callback to be executed once the mining is finished
 * @api public
 */

function query(file, callback) {
  miner(parser.query, file, callback);
}

module.exports = {
  query: query
};
