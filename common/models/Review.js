'use strict';

module.exports = function(Review) {
  // Model is the model class
  // options is an object containing the config properties from model definition
  Review.defineProperty('created', {type: Date, default: '$now'});
};
