'use strict';

var loopback = require('loopback');
var app = module.exports = loopback();
var boot = require('loopback-boot');
var loopbackPassport = require('loopback-component-passport');
var http = require('http');
var https = require('https');
var PassportConfigurator = loopbackPassport.PassportConfigurator;
var passportConfigurator = new PassportConfigurator(app);
var sslConfig = require('./ssl-config');

app.start = function() {
  return app.listen(function() {
    app.emit('started');
    var baseUrl = app.get('url').replace(/\/$/, '');
    console.log('Web server listening at: %s', baseUrl);
    if (app.get('loopback-component-explorer')) {
      var explorerPath = app.get('loopback-component-explorer').mountPath;
      console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
    }
  });
};

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function(err) {
  if (err) throw err;

  // start the server if `$ node server.js`
  if (require.main === module)
    app.start();
});

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

for (var s in config) {
  var c = config[s];
  c.session = c.session !== false;
  // overriding default user object
  c.profileToUser = customProfileToUser;
  passportConfigurator.configureProvider(s, c);
}

function customProfileToUser(provider, profile, options) {
  var userInfo = {};
  if (provider === 'facebook' || provider === 'google') {
    userInfo = {
      username: profile._json.first_name + ' ' + profile._json.last_name,
      password: 'secret',
      email: profile._json.email,
    };
  }
  return userInfo;
}
