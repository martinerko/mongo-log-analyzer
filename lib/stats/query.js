/*!
 * mongo-log-analyzer
 * Copyright(c) 2016 martinerko <martinerko@gmail.com>
 * MIT Licensed
 */

var debug = require('debug')('mongo-log-analyzer:stats:query');
var isObject = require('lodash.isobject');
var pick = require('lodash.pick');
var stringifyCanonical = require('../stringify-canonical');


/**
 * Constants
 */

var REGEXP_REPLACE_ADD_PROPERTY_QUOTES = /\s(\$?[^("|\:|\,|\{|\}|\[|\])]+)\:/g,
  REGEXP_REPLACE_ADD_MONGO_TYPES_QUOTES = /(NumberLong|ObjectId|ISODate)\(['"]?([^(\)|'|")]+)['"]?\)/g,
  REGEXP_REPLACE_ESCAPED_CHARACTERS = /\\.{1}/g,
  REGEXP_REPLACE_WHITE_SPACES = /\s/g,
  REGEXP_REPLACE_REGEXP_LITERALS = /("[^"]+"\:\s)(\/\^?)([^\/]+)\//g;

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
 * Converts received string into an object
 * The string is actually parsed query from mongod log.
 *
 * @param  {String} queryText
 * @param  {Function} reviver
 * @return {Object?}
 * @api private
 */
function queryText2JSON(queryText, reviver) {
  try {
    var q = JSON.parse(queryText, reviver);
    var info = {
      $query: {},
      $orderby: {}
    };
    // the log data might be structured into query and orderby info
    if (q.hasOwnProperty('$query')) {
      Object.assign(info, pick(q, ['$query', '$orderby']));
    } else {
      info["$query"] = q;
    }
    return info;
  } catch (e) {
    debug("Can't parse %s" + queryText);
  }
  return;
}


/**
 * JSON parse reviver function which replace all values with 1
 */

function queryReviver(k, v) {
  switch (k) {
    case '':
    case '$orderby':
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
    var queryObj = queryText2JSON(queryText, queryReviver);
    if (queryObj) {
      result.push(Object.assign({}, item, {
        'query': stringifyCanonical(queryObj['$query']),
        'orderby': stringifyCanonical(queryObj['$orderby'])
      }));
    }

    return result;
  }, []);
}

module.exports = {
  HISTOGRAM_RANGES: HISTOGRAM_RANGES,
  processData: processData
};
