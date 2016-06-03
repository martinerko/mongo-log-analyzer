/*!
 * mongo-log-analyzer
 * Copyright(c) 2016 martinerko <martinerko@gmail.com>
 * MIT Licensed
 */

var debug = require('debug')('mongo-log-analyzer:stats:query');
var isObject = require('lodash.isobject');
var stringifyCanonical = require('../stringify-canonical');


/**
 * Constants
 */

var REGEXP_REPLACE_ADD_PROPERTY_QUOTES = /\s(\$?[^("|\:|\,|\{|\}|\[|\])]+)\:/g,
  REGEXP_REPLACE_ADD_MONGO_TYPES_QUOTES = /(NumberLong|ObjectId|ISODate)\(['"]?([^(\)|'|")]+)['"]?\)/g,
  REGEXP_REPLACE_ESCAPED_CHARACTERS = /\\.{1}/g,
  REGEXP_REPLACE_WHITE_SPACES = /\s/g,
  REGEXP_REPLACE_REGEXP_LITERALS = /("[^"]+"\:\s)(\/\^?)([^\/]+)\//g,
  REGEXP_PARSE_ORDERBY_INFO = /"\$?orderby"\: (\{[^\}]+\})/;

var HISTOGRAM_RANGES = [150, 250, 500, 1000, 5000];

/**
 * Removes unnecessery data from parsed query and adds quotes to make
 * query string covertible into JSON object later on.
 *
 * @param  {String} queryText
 * @return {String}
 * @api private
 */

function cleanupQueryText(queryText) {
  var parsed = queryText.replace(REGEXP_REPLACE_ADD_PROPERTY_QUOTES, ' "$1":') //
    .replace(REGEXP_REPLACE_ADD_MONGO_TYPES_QUOTES, '"$1($2)"') //
    .replace(REGEXP_REPLACE_ESCAPED_CHARACTERS, '') //
    .replace(REGEXP_REPLACE_WHITE_SPACES, ' ') // replace all whitespaces (tabs, new lines) with normal space
    .replace(REGEXP_REPLACE_REGEXP_LITERALS, '$1"$21/"');

  return parsed;
}

/**
 * Analyze received string and pick query and orderby info.
 * Received string value represents parsed query record from mongod log.
 *
 * @param  {String} queryText
 * @return {Object?}
 * @api private
 */
function analyzeQueryText(queryText) {
  try {
    var qObj = JSON.parse(queryText, queryReviver);
    var orderby = queryText.match(REGEXP_PARSE_ORDERBY_INFO);
    var query;

    if (qObj.hasOwnProperty('$query')) {
      query = qObj['$query'];
    } else if (qObj.hasOwnProperty('query')) {
      query = qObj['query'];
    } else {
      query = qObj;
    }

    return {
      $query: stringifyCanonical(query),
      $orderby: orderby ? orderby[1] : '{}'
    };
  } catch (e) {
    debug('Can\'t parse %s' + queryText);
  }
  return;
}


/**
 * JSON parse reviver function which replace all values with 1
 */

function queryReviver(k, v) {
  switch (k) {
    case '':
      return v;
    default:
      return isObject(v) ? queryReviver('', v) : 1;
  }
}

/**
 * API
 *
 * process data parsed by miner and convert them into JSON objects
 *
 * @param  {Array} items
 * @return {Array}
 * @api public
 */

function processData(items) {
  return items.reduce(function(result, item) {
    var queryText = cleanupQueryText(item.rawQuery);
    var queryObj = analyzeQueryText(queryText);
    if (queryObj) {
      result.push(Object.assign({}, item, {
        'query': queryObj['$query'],
        'orderby': queryObj['$orderby']
      }));
    }

    return result;
  }, []);
}

module.exports = {
  HISTOGRAM_RANGES: HISTOGRAM_RANGES,
  processData: processData
};
