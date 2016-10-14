/**
 * @file
 * config holds the configuration for the app and accepts config updates.
 */

angular.module('BibBox').value('config', {
  "translations": {},
  "languages": [],
  "features": [],
  "timeout": {
    "idleTimeout": 15,
    "IdleWarn": 5
  },
  "testFbsConnectionInterval": 5000
});