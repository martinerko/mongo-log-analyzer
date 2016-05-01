/*!
 * mongo-log-analyzer
 * Copyright(c) 2016 martinerko <martinerko@gmail.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var isObject = require('lodash.isobject');

/**
 * Returns shallow copy of an received object with the keys sorted
 * in alphabetical order.
 *
 * @param  {Object} obj  source object
 * @return {Object}
 * @api private
 */

function canonical(object) {
  if (!isObject(object)) {
    return object;
  }

  if (Array.isArray(object)) {
    return object.map(canonical);
  }

  return Object.keys(object).sort().reduce(function(result, p) {
    var val = object[p];
    result[p] = isObject(val) ? canonical(val) : val;
    return result;
  }, {});
}

/**
 * API
 *
 * @param  {Object} obj  json object to be stringified
 * @return {String}
 * @api public
 */

function stringifyCanonical(obj) {
  return JSON.stringify(canonical(obj));
}

module.exports = stringifyCanonical;
