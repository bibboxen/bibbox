/**
 * @file
 * Service to keep track of user login attempts.
 */

angular.module('BibBox').service('userTrackerService', ['$interval', 'config',
  function ($interval, config) {
    'use strict';

    var loginAttempts = {};
    var self = this;

    /**
     * Check if user has reached login attempt limit.
     *
     * @param username
     *  Username of the user to check.
     *
     * @returns {boolean}
     *   If limit reached false else true.
     */
    this.check = function check(username) {
      return loginAttempts[username].attempts >= config.loginAttempts.max;
    };

    /**
     * Add user to tracking.
     *
     * This will also incremented the attempt counter if the user already
     * exists.
     *
     * @param username
     *   Username of the user to track.
     */
    this.add = function add(username) {
      if (!loginAttempts.hasOwnProperty(username)) {
        // Don't exists an user is added.
        loginAttempts[username] = {
          date: new Date().getTime(),
          attempts: 0
        };
      }

      // Incremented login attempt.
      loginAttempts[username].attempts++;
    };

    /**
     * Clear tracking of a given user.
     *
     * @param username
     *  User to remove/clear tracking for.
     */
    this.clear = function clear(username) {
      delete loginAttempts[username];
    };

    /**
     * Interval to automatically remove user from tracking if time limit is
     * reached before max login attempts.
     *
     * It check every 5 sec. as that should be more than fine.
     */
    $interval(function () {
      var time = new Date().getTime();
      var limit = config.loginAttempts.timeLimit;
      for (var username in loginAttempts) {
        if (loginAttempts[username].date + limit <= time) {
          self.clear(username);
        }
      }
    }, 5000);
  }
]);
