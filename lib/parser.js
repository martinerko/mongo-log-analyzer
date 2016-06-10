/*!
 * mongo-log-analyzer
 * Copyright(c) 2016 martinerko <martinerko@gmail.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */
var uniq = require('lodash.uniq');

/**
 * Constants
 */
var REQEXP_PARSE_QUERY_INFO = /^.+query\s([^\s]+)\s+query\:\s+(\{.+)\splanSummary\:\s([A-Z]+(?:\s\{\s[^\}]+\})*(?:\,\s[A-Z]+\s\{\s[^\}]+\})*).+\s(\d+)ms$/;
var REGEXP_PARSE_INDEX_INFO = /\{[^\}]+\}/g;

/**
 * Converts receceived array into an object.
 *
 * @param  {Array} data
 * @return {Object}
 * @api private
 */

function logEntryToJSON(data) {
  var indexInfo = resolveIndexInfo(data[3]);
  return {
    ns: data[1],
    rawQuery: data[2],
    stage: indexInfo.stage,
    index: indexInfo.index,
    time: Number(data[4])
  };
}

/**
 * Converts receceived planSummary string into an object
 * with info about used stages and indexes
 *
 * @param  {String} planSummary
 * @return {Object}
 * @api private
 */

function resolveIndexInfo(planSummary) {
  var indexes = planSummary.match(REGEXP_PARSE_INDEX_INFO);
  var stages = planSummary.replace(REGEXP_PARSE_INDEX_INFO, '').replace(/\s*/g, '').split(',');
  return {
    index: uniq(indexes).join(', '),
    stage: uniq(stages).join(', ')
  };
}

/**
 * API
 *
 * @param  {String} text  line from mongod log to be parsed
 * @return {Array?}
 * @api public
 */

function query(text) {
  var match = REQEXP_PARSE_QUERY_INFO.exec(text);
  return match && logEntryToJSON(match);
}

module.exports = {
  query: query
};
