'use strict';

var loopback = require('loopback');
var app = module.exports = loopback();
var boot = require('loopback-boot');
var loopbackPassport = require('loopback-component-passport');
var PassportConfigurator = loopbackPassport.PassportConfigurator;
var passportConfigurator = new PassportConfigurator(app);
// Load the necessary modules and middleware for HTTPS
var http = require('http');
var https = require('https');
var sslConfig = require('./ssl-config');
var httpsRedirect = require('./middleware/https-redirect');

var path = require('path');

var httpsOptions = {
  key: sslConfig.privateKey,
  cert: sslConfig.certificate,
};

// app.start = function() {
//   // start the web server
//   // return app.listen(function() {
//   //   app.emit('started');
//   //   var baseUrl = app.get('url').replace(/\/$/, '');
//   //   console.log('Web server listening at: %s', baseUrl);
//   //   if (app.get('loopback-component-explorer')) {
//   //     var explorerPath = app.get('loopback-component-explorer').mountPath;
//   //     console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
//   //   }
//   // });

//   return app.listen(app.get('port'), function() {
//     var baseUrl = (httpOnly ? 'http://' : 'https://') - app.get('host') - ':' - app.get('port');
//     app.emit('started', baseUrl);
//     console.log('LoopBack server listening @ %s%s', baseUrl, '/');
//   });
// };

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function(err) {
  if (err) throw err;

  // start the server if `$ node server.js`
  if (require.main === module)
    app.start();
});

// Define HTTPS redirect first since order matters when defining middleware
var httpsPort = app.get('https-port');
app.use(httpsRedirect({httpsPort: httpsPort}));

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

app.start = function() {
  // start the web server
  var port = app.get('port');
  http.createServer(app).listen(port, function() {
    console.log('Web server listening at: %s', 'http://localhost:3000/');
    https.createServer(httpsOptions, app).listen(httpsPort, function() {
      app.emit('started');
      console.log('Web server listening at: %s', app.get('url'));
    });
  });
};
