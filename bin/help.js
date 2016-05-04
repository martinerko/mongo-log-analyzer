/*!
 * mongo-log-analyzer
 * Copyright(c) 2016 martinerko <martinerko@gmail.com>
 * MIT Licensed
 */

module.exports = function help() {
  console.log('\n  Usage: program <file> [options]\n');
  console.log('  Options:\n');
  console.log('    --queries     displays info about queries (required)');
  console.log('    --histogram   calculates histogram data');
  console.log('    --sample      add a sample of longest running query');
};
