/*!
 * mongo-log-analyzer
 * Copyright(c) 2016 martinerko <martinerko@gmail.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var find = require('lodash.find');
var pick = require('lodash.pick');
var queryHelpers = require('./stats/query');
var generalStatsHelpers = require('./stats/helpers');
var processQueryData = queryHelpers.processData;
var getPropertyValue = generalStatsHelpers.getPropertyValue;
var histogram = generalStatsHelpers.histogram;
var histogramPercentage = generalStatsHelpers.histogramPercentage;
var mean = generalStatsHelpers.mean;
var sortByNumber = generalStatsHelpers.sortByNumber;

/**
 * Constants
 */

var HISTOGRAM_RANGES_FOR_QUERIES = queryHelpers.HISTOGRAM_RANGES;
var DEFAULT_STATS_PROPRS = ['ns', 'stage', 'index', 'query', 'orderby'];

/**
 * Groups query data to be able to create statistics later on.
 *
 * @param  {Object} data
 * @return {Array}
 * @api private
 */

function groupByQueryInfo(data) {
  return data.reduce(function(map, item) {
    var key = item["ns"] + item["query"] + item["orderby"];

    if (!map.hasOwnProperty(key)) {
      map[key] = [];
    }
    map[key].push(item);

    return map;
  }, {});
}

/**
 * API
 *
 * Method which calculates the statistics based on recevied query data.
 * The first argument can be an array of parsed query objects returned
 * from miner or an object with parameters:
 * 		data:        array of parsed query objects
 * 		histogram:   flag saying that histogram statistic will be calculated
 * 		sample:      flag saying that the output will contain always also sample
 * 	 							 query (the longest running one will be choosen).
 *
 *
 * @param  {Array|Object} args  data or options for query statitics
 * @param  {Function} callback  callback to be executed with statistics
 * @api public
 */

function query(args, callback) {
  var data = [];
  var calculateHistogram = false;
  var sampleData = false;

  if (Array.isArray(args)) {
    data = args;
  } else {
    data = args.data;
    calculateHistogram = args.histogram === true;
    sampleData = args.sample === true;
  }
  var queryData = processQueryData(data);
  var queryMap = groupByQueryInfo(queryData);

  var stats = Object.keys(queryMap).map(function(key) {
    var queryCalls = queryMap[key];
    var times = queryCalls.map(getPropertyValue.bind(null, 'time')).sort(sortByNumber);
    var count = times.length;
    var min = times[0];
    var max = times[count - 1];

    var statsObj = Object.assign(pick(queryCalls[0], DEFAULT_STATS_PROPRS), {
      min: min,
      max: max,
      mean: Math.round(mean(times)),
      count: count
    });

    if (calculateHistogram) {
      statsObj.histogram = histogram(times, HISTOGRAM_RANGES_FOR_QUERIES);
      statsObj.histogramPercentage = histogramPercentage(count, statsObj.histogram);
    }

    if (sampleData) {
      statsObj.sample = find(queryCalls, function(q) {
        return q.time == max;
      }).rawQuery;
    }

    return statsObj;
  });

  callback(null, stats);
}

module.exports = {
  query: query
};
