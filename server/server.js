'use strict';

var loopback = require('loopback');
var boot = require('loopback-boot');
var loopbackPassport = require('loopback-component-passport');
var http = require('http');
var https = require('https');
var PassportConfigurator = loopbackPassport.PassportConfigurator;
var passportConfigurator = new PassportConfigurator(app);
var sslConfig = require('./ssl-config');

var app = module.exports = loopback();

// app.start = function() {
//   return app.listen(function() {
//     app.emit('started');
//     var baseUrl = app.get('url').replace(/\/$/, '');
//     console.log('Web server listening at: %s', baseUrl);
//     if (app.get('loopback-component-explorer')) {
//       var explorerPath = app.get('loopback-component-explorer').mountPath;
//       console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
//     }
//   });
// };

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
// boot(app, __dirname, function(err) {
//   if (err) throw err;

//   // start the server if `$ node server.js`
//   if (require.main === module)
//     app.start();
// });

// Load the provider configurations
var config = {};
try {
  config = require('./providers.json');
} catch (err) {
  console.error('Please configure your passport strategy in `providers.json`.');
  process.exit(1);
}
// Initialize passport
passportConfigurator.init();

// Set up related models
passportConfigurator.setupModels({
  userModel: app.models.user,
  userIdentityModel: app.models.userIdentity,
  userCredentialModel: app.models.userCredential,
});
// Configure passport strategies for third party auth providers
for (var s in config) {
  var c = config[s];
  c.session = c.session !== false;
  passportConfigurator.configureProvider(s, c);
};

// boot scripts mount components like REST API
boot(app, __dirname);

app.start = function(httpOnly) {
  if (httpOnly === undefined) {
    httpOnly = process.env.HTTP;
  }
  var server = null;
  if (!httpOnly) {
    var options = {
      key: sslConfig.privateKey,
      cert: sslConfig.certificate,
    };
    server = https.createServer(options, app);
  } else {
    server = http.createServer(app);
  }
  server.listen(app.get('port'), function() {
    var baseUrl = (httpOnly ? 'http://' : 'https://') + app.get('host') + ':' + app.get('port');
    app.emit('started', baseUrl);
    console.log('LoopBack server listening @ %s%s', baseUrl, '/');
    if (app.get('loopback-component-explorer')) {
      var explorerPath = app.get('loopback-component-explorer').mountPath;
      console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
    }
  });
  return server;
};

// start the server if `$ node server.js`
if (require.main === module) {
  app.start();
}
