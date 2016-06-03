/*!
 * mongo-log-analyzer
 * Copyright(c) 2016 martinerko <martinerko@gmail.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var assert = require('assert');
var lib = require('..');
var path = require('path');

/**
 * Constants
 */

var LOG_FILE = path.resolve(__dirname, './data/mongod.log');

describe("stats module for queries", function() {
  this.timeout(30000);
  var queries;

  before(function(done) {
    lib.miner.query(LOG_FILE, function(err, results) {
      queries = results;
      done();
    });
  });

  it("should return 15 statistic records", function(done) {
    lib.stats.query(queries, function(err, results) {
      assert.equal(15, results.length);
      done();
    });
  });


  describe("when executed with basic settings", function() {
    it("should return only basic statistic details when executed with an array as a first argument", function() {
      lib.stats.query(queries, function(err, results) {
        var expectedKeys = 'count,index,max,mean,min,ns,orderby,query,stage';
        assert.equal(expectedKeys, Object.keys(results[0]).sort().join(','));
      });
    });

    it("should return only basic statistic details if only 'data' attribute was specifie", function(done) {
      lib.stats.query({
        data: queries
      }, function(err, results) {
        var expectedKeys = 'count,index,max,mean,min,ns,orderby,query,stage';
        assert.equal(expectedKeys, Object.keys(results[0]).sort().join(','));
        done();
      });
    });

  });

  describe("when executed with additional settings", function() {
    var histogramStats;
    it("should return also histogram details when additional 'histogram' parameter was specified", function(done) {
      lib.stats.query({
        data: queries,
        histogram: true
      }, function(err, results) {
        histogramStats = results;
        var expectedKeys = 'count,histogram,histogramPercentage,index,max,mean,min,ns,orderby,query,stage';
        assert.equal(expectedKeys, Object.keys(results[0]).sort().join(','));
        done();
      });
    });

    var sampleStats;
    it("should return also sample query details when additional 'sample' parameter was specified", function(done) {
      lib.stats.query({
        data: queries,
        sample: true
      }, function(err, results) {
        sampleStats = results;
        var expectedKeys = 'count,index,max,mean,min,ns,orderby,query,sample,stage';
        assert.equal(expectedKeys, Object.keys(results[0]).sort().join(','));
        done();
      });
    });
  });

  describe("query statistics:", function() {
    var queryStats;

    before(function(done) {
      lib.stats.query(queries, function(err, results) {
        queryStats = results;
        done();
      });
    });


    describe("for 'document' collection", function() {
      var documentQueryStats;
      before(function() {
        documentQueryStats = queryStats.filter(function(item) {
          return item.ns === 'sample-db.document';
        });
      });

      it("should appear twice", function() {
        assert.equal(2, documentQueryStats.length);
      });

      it("should contain one entry with COLLSCAN stage without index", function() {
        var collscanQueries = documentQueryStats.filter(function(item) {
          return item.stage === 'COLLSCAN';
        });
        assert.equal(1, collscanQueries.length);
      });

      it("should contain one entry with IXSCAN stage with correct index resolved", function() {
        var ixscanQueries = documentQueryStats.filter(function(item) {
          return item.stage === 'IXSCAN';
        });
        assert.equal(1, ixscanQueries.length);
      });
    });

    describe("for 'policy' collection", function() {
      var policyAllQueryStats;
      var policyEmptyQueryStats;

      before(function() {
        policyAllQueryStats = queryStats.filter(function(item) {
          return item.ns === 'sample-db.policy';
        });

        policyEmptyQueryStats = policyAllQueryStats.filter(function(item) {
          return item.query === '{}';
        });
      });

      it("should appear twice", function() {
        assert.equal(2, policyAllQueryStats.length);
      });

      it("should contain one grouped entry of two records for case where query is empty and orderby is specified and same for both cases", function() {
        assert.equal(1, policyEmptyQueryStats.length);
        assert.equal(2, policyEmptyQueryStats[0].count);
      });
    });

    describe("for 'chunks' collection", function() {
      var chunkQueryStats;
      before(function() {
        chunkQueryStats = queryStats.filter(function(item) {
          return item.ns === 'sample-db.chunks';
        });
      });

      it("should appear only once", function() {
        assert.equal(1, chunkQueryStats.length);
      });

      it("should contain correct count value", function() {
        assert.equal(3, chunkQueryStats[0].count);
      });

      it("should contain correct min value", function() {
        assert.equal(160, chunkQueryStats[0].min);
      });

      it("should contain correct max value", function() {
        assert.equal(298, chunkQueryStats[0].max);
      });

      it("should contain correct max value", function() {
        assert.equal(227, chunkQueryStats[0].mean);
      });
    });
  });

  describe("histogram statistics:", function() {
    var queryStats;
    before(function(done) {
      lib.stats.query({
        data: queries,
        histogram: true
      }, function(err, results) {
        queryStats = results;
        done();
      });
    });

    describe("for 'chunks' collection", function() {
      var chunkQueryStats;
      it("should have correct distribution", function() {
        chunkQueryStats = queryStats.filter(function(item) {
          return item.ns === 'sample-db.chunks';
        })[0];

        var histogramStats = chunkQueryStats.histogram;
        var histogramPercentageStats = chunkQueryStats.histogramPercentage;
        assert.equal(2, histogramStats['250']);
        assert.equal(1, histogramStats['500']);

        assert.equal(66.67, histogramPercentageStats['250']);
        assert.equal(33.33, histogramPercentageStats['500']);
      });
    });
  });

  describe("sample data:", function() {
    var queryStats;
    before(function(done) {
      lib.stats.query({
        data: queries,
        sample: true
      }, function(err, results) {
        queryStats = results;
        done();
      });
    });

    describe("for 'chunks' collection", function() {
      var chunkQueryStats;
      it("should contain the longest running query sample", function() {
        chunkQueryStats = queryStats.filter(function(item) {
          return item.ns === 'sample-db.chunks';
        })[0];

        assert.equal("{ files_id: ObjectId('X65dd8da9e8bf11307000002'), n: 2 }", chunkQueryStats.sample);
      });
    });
  });
});
