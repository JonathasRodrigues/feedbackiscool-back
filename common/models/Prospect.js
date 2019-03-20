'use strict';

module.exports = function(Prospect) {
    // Model is the model class
  // options is an object containing the config properties from model definition
  Prospect.defineProperty('created', {type: Date, default: '$now'});
};
