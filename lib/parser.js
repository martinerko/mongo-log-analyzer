/*!
 * mongo-log-analyzer
 * Copyright(c) 2016 martinerko <martinerko@gmail.com>
 * MIT Licensed
 */

/**
 * Constants
 */

var REQEXP_PARSE_QUERY_INFO = /^.+query\s([^\s]+)\s+query\:\s+(\{.+)\splanSummary\:\s([A-Z]+)\s(\{\s[^\}]+\}){0,1}.+\s(\d+)ms$/;

/**
 * Converts receceived array into an object.
 *
 * @param  {Array} data
 * @return {Object}
 * @api private
 */

function logEntryToJSON(data) {
  return {
    ns: data[1],
    rawQuery: data[2],
    stage: data[3],
    index: data[4],
    time: Number(data[5])
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
