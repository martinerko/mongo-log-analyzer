/*!
 * mongo-log-analyzer
 * Copyright(c) 2016 martinerko <martinerko@gmail.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var remove = require('lodash.remove');

/**
 * Several helper functions used by stats module.
 */

function getPropertyValue(p, item) {
  return item[p];
}

function sum(items) {
  return items.reduce(function(total, value) {
    return total + value;
  }, 0);
}

function mean(items) {
  return sum(items) / items.length;
}

function sortByNumber(a, b) {
  return Number(a) - Number(b);
}

/**
 * API
 *
 * Calculates histogram distribution.
 *
 * @param  {Array} items
 * @param  {Number[]} ranges
 * @return {Object}
 * @api public
 */

function histogram(items, ranges) {
  var histogram = ranges.sort(sortByNumber).reduce(function(map, upToVal) {
    map[String(upToVal)] = remove(items, function(val) {
      return val <= upToVal;
    }).length;
    return map;
  }, {});
  // if it is out of provided range values, store it here
  histogram['rest'] = items.length;

  return histogram;
}

/**
 * Converts histogram distribution data into percentage values.
 *
 * @param  {Number} count         total number
 * @param  {Object} histogramMap  map with histogram detail provided by function above
 * @return {Object}
 * @api public
 */

function histogramPercentage(count, histogramMap) {
  var portion = 100 / count;

  return Object.keys(histogramMap).reduce(function(map, key) {
    var percentage = histogramMap[key] * portion;
    map[key] = parseFloat(Math.round(percentage * 100) / 100).toFixed(2);
    return map;
  }, {});
}

module.exports = {
  getPropertyValue: getPropertyValue,
  histogram: histogram,
  histogramPercentage: histogramPercentage,
  mean: mean,
  sortByNumber: sortByNumber,
  sum: sum
};
