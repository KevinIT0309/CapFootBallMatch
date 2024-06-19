const cds = require('@sap/cds');

const { updateMatchResults } = require('./update_matches.js')

// Bootstrap middleware
cds.on('bootstrap', (app) => {
  console.log('Bootstrap middleware...');
  updateMatchResults();
});

module.exports = cds.server;
