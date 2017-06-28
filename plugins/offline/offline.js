/**
 * @file
 *
 */

'use strict';

var Queue = require('bull');
var Q = require('q');
var uniqid = require('uniqid');

// Global self is used be queued jobs to get access to the bus.
var self = null;

/**
 *
 * @constructor
 */
var Offline = function Offline(bus, host, port) {
  this.bus = bus;
  var self = this;

  // Create the queues, if they exists in redis they will just reconnect.
  this.checkinQueue = Queue('Check-in', port, host);
  this.checkoutQueue = Queue('Check-out', port, host);

  // Set the front-end out-of-order on queue errors (redis errors included).
  this.checkinQueue.on('error', function (err) {
    self.bus.emit('logger.err', err);
    self.bus.emit('frontend.outOfOrder');
  });
  this.checkoutQueue.on('error', function (err) {
    self.bus.emit('logger.err', err);
    self.bus.emit('frontend.outOfOrder');
  });

  // Add job processing functions to the queues.
  this.checkinQueue.process(this.checkin);
  this.checkoutQueue.process(this.checkout);

  // Listen to fail jobs in the check-in queue. As jobs in processing is not
  // paused when the queue is... we need to handle errors in processing jobs
  // due to FBS offline.
  this.checkinQueue.on('failed', function (job, err) {
    if (err.message === 'FBS is offline') {
      job.remove().then(function () {
        // Job remove to re-add it as a new job.
        self.add('checkin', job.data);
      },
      function (err) {
        // If we can't remove the job... not much we can do.
        self.bus('logger.offline', err.message);
      });
    }
  });

  // Listen to fail jobs in the check-out queue. As jobs in processing is not
  // paused when the queue is... we need to handle errors in processing jobs
  // due to FBS offline.
  this.checkoutQueue.on('failed', function (job, err) {
    if (err.message === 'FBS is offline') {
      job.remove().then(function () {
        // Job remove to re-add it as a new job.
        self.add('checkout', job.data);
      },
      function (err) {
        // If we can't remove the job... not much we can do.
        self.bus('logger.offline', err.message);
      });
    }
  });

  // Start the queues paused.
  this.pause('checkin');
  this.pause('checkout');

  /**
   * Listen for online events and change state.
   */
  this.bus.on('fbs.online', function online() {
    self.resume('checkin');
    self.resume('checkout');
  });

  /**
   * Listen for offline events and change state.
   */
  this.bus.on('fbs.offline', function online() {
    self.pause('checkin');
    self.pause('checkout');
  });
};

/**
 * Find queue based on queue type.
 *
 * @param type
 *  The type of queue (checkin or checkout).
 *
 * @returns {*}
 *   The queue if found. If not null.
 *
 * @private
 */
Offline.prototype._findQueue = function _findQueue(type) {
  var queue = null;

  switch (type) {
    case 'checkin':
      queue = this.checkinQueue;
      break;

    case 'checkout':
      queue = this.checkoutQueue;
      break;
  }

  return queue;
};

/**
 * Get the list of failed jobs.
 *
 * @param {string} type
 *   The queue type to get jobs from (checkin or checkout).
 *
 * @returns {null|*|jQuery.promise|Function|promise|d}
 *   Promise that will resolve with job count and the failed jobs.
 */
Offline.prototype.getFailedJobs = function getFailedJobs(type) {
  var deferred = Q.defer();

  var queue = this._findQueue(type);

  queue.getFailed().then(function (failedJobs) {
    var jobs = [];
    for (var i in failedJobs) {
      var job = failedJobs[i];

      // Clean internal book keeping information from the jobs data.
      var data = job.data;
      delete data.busEvent;
      delete data.errorEvent;
      delete data.queued;

      jobs.push({
        type: job.queue.name,
        jobId: job.jobId,
        timestamp: job.timestamp,
        data: data,
        reason: job.failedReason
      });
    }
    queue.getFailedCount().then(function (count) {
        deferred.resolve({
          count: count,
          jobs: jobs
        });
    }, function (err) {
      deferred.reject(err);
    });
  }, function (err) {
    deferred.reject(err);
  });

  return deferred.promise;
};

/**
 * Get counts (number of jobs) in the different stats.
 *
 * @param {string} type
 *   The queue type to get jobs from (checkin or checkout).
 *
 * @returns {null|*|jQuery.promise|Function|promise|d}
 *   Promise that will resolve with job counts.
 */
Offline.prototype.getQueueCounts = function getQueueCounts(type) {
  var deferred = Q.defer();

  var queue = this._findQueue(type);
  var counts = {};

  Q.all([
    queue.getCompletedCount(),
    queue.getPausedCount(),
    queue.getFailedCount(),
    queue.getDelayedCount(),
    queue.getActiveCount(),
    queue.getWaitingCount()
  ]).then(function (data) {
    deferred.resolve({
      completed: data[0],
      paused: data[1],
      failed: data[2],
      delayed: data[3],
      active: data[4],
      waiting: data[5]
    });
  }, function (err) {
    deferred.reject(err);
  });

  return deferred.promise;
};

/**
 * Pause a queue.
 *
 * @param type
 *  The type of queue (checkin or checkout).
 */
Offline.prototype.pause = function pause(type) {
  var self = this;
  var queue = this._findQueue(type);

  queue.pause().then(function () {
    self.bus.emit('logger.offline', 'Queue "' + queue.name + '" is paused.');
  });
};

/**
 * Resume a queue.
 *
 * @param type
 *  The type of queue (checkin or checkout).
 */
Offline.prototype.resume = function resume(type) {
  var self = this;
  var queue = this._findQueue(type);

  queue.resume().then(function () {
    self.bus.emit('logger.offline', 'Queue "' + queue.name + '" has resumed.');
  });
};

/**
 * Add job to a queue.
 *
 * @param type
 *   The type of queue (checkin or checkout).
 * @param data
 *   The data to process.
 *
 * @returns {*}
 *   Promise that resolves to jobId if added else error.
 */
Offline.prototype.add = function add(type, data) {
  var deferred = Q.defer();
  var queue = this._findQueue(type);

  var opts = {
    attempts: 5,
    backoff: {
      type: 'exponential',
      delay: 10000
    }
  };

  queue.add(data, opts).then(function (job) {
    deferred.resolve(job.jobId);
  },
  function (err) {
    deferred.reject(err);
  });

  return deferred.promise;
};

/**
 * Processing function for check-in jobs.
 *
 * @param job
 *   The job.
 * @param done
 *   Callback when done processing.
 */
Offline.prototype.checkin = function checkin(job, done) {
  var data = job.data;
  var self = this;

  self.bus.once(data.busEvent, function (res) {
    if (res.ok === '0') {
      self.bus.emit('logger.offline', 'error: ' + require('util').inspect(res, true, 10));
      done(new Error(res.screenMessage));
    }
    else {
      // Remove item form backup files. We don't listen to if it success or
      // fails the remove as we won't mark the job as failed as it has been
      // completed at FBS.
      self.bus.emit('storage.remove.item', {
        type: 'offline',
        name: data.file,
        itemIdentifier: data.itemIdentifier,
        busEvent: 'offline.remove.item.checkin' + uniqid(),
        errorEvent: 'offline.remove.item.checkin.error' + uniqid()
      });

      // Success the item have been checked-in.
      done(null, res);
    }
  });

  self.bus.once(data.errorEvent, function (err) {
    // Log the failure.
    self.bus.emit('logger.offline', 'error: ' + err.message);
    done(err);
  });

  // Request from the offline queue need to have the noBlock set to true to
  // ensure that the check-in is forced in the library system.
  data.noBlock = true;

  // Set updated timestamp to get past event timeout check in FBS plugin.
  data.timestamp = new Date().getTime();

  // Send request to FBS.
  self.bus.emit('fbs.checkin', data);
};

/**
 * Processing function for checkout jobs.
 *
 * @param job
 *   The job.
 * @param done
 *   Callback when done processing.
 */
Offline.prototype.checkout = function checkout(job, done) {
  var data = job.data;
  var self = this;

  self.bus.once(data.busEvent, function (res) {
    if (res.ok === '0') {
      // @TODO: Check here screen-message if the user should be changed due to
      //        wrong username or password.
      self.bus.emit('logger.offline', 'error: ' + require('util').inspect(res, true, 10));
      done(new Error(res.screenMessage));
    }
    else {
      // Remove item form backup files. We don't listen to if it success or
      // fails the remove as we won't mark the job as failed as it has been
      // completed at FBS.
      self.bus.emit('storage.remove.item', {
        type: 'offline',
        name: data.file,
        itemIdentifier: data.itemIdentifier,
        busEvent: 'offline.remove.item.checkin' + uniqid(),
        errorEvent: 'offline.remove.item.checkin.error' + uniqid()
      });

      // Success the item have been checked-out.
      done(null, res);
    }
  });

  self.bus.once(data.errorEvent, function (err) {
    // Log the failure.
    self.bus.emit('logger.offline', 'error: ' + err.message);
    done(err);
  });

  // Request from the offline queue need to have the noBlock set to true to
  // ensure that the check-out is forced in the library system.
  data.noBlock = true;

  // Set updated timestamp to get past event timeout check in FBS plugin.
  data.timestamp = new Date().getTime();

  // Send request to FBS.
  self.bus.emit('fbs.checkout', data);
};

/**
 * Register the plugin with architect.
 *
 * @param {array} options
 *   Options defined in app.js.
 * @param {array} imports
 *   The other plugins available.
 * @param {function} register
 *   Callback function used to register this plugin.
 */
module.exports = function (options, imports, register) {
  var bus = imports.bus;
  var offline = new Offline(bus, options.host, options.port);

  bus.on('offline.add.checkout', function (obj) {
    var data = JSON.parse(JSON.stringify(obj));

    // Added event info to job.
    data.busEvent = 'offline.fbs.checkout.success' + data.itemIdentifier;
    data.errorEvent = 'offline.fbs.checkout.error' + data.itemIdentifier;
    data.queued = true;

    offline.add('checkout', data);
  });

  bus.on('offline.add.checkin', function (obj) {
    var data = JSON.parse(JSON.stringify(obj));

    // Added event info to job.
    data.busEvent = 'offline.fbs.checkin.success' + data.itemIdentifier;
    data.errorEvent = 'offline.fbs.checkin.error' + data.itemIdentifier;
    data.queued = true;

    offline.add('checkin', data);
  });

  bus.on('offline.failed.jobs', function (data) {
    var jobs = {};
    offline.getFailedJobs('checkout').then(function (checkoutJobs) {
      jobs.checkout = checkoutJobs;
      offline.getFailedJobs('checkin').then(function (checkinJobs) {
        jobs.checkin = checkinJobs;
        bus.emit(data.busEvent, jobs);
      }, function (err) {
        bus.emit(data.errorEvent, err);
      });
    }, function (err) {
      bus.emit(data.errorEvent, err);
    });
  });

  bus.on('offline.counts', function (data) {
    var counts = {};
    offline.getQueueCounts('checkout').then(function (checkoutCounts) {
      counts.checkout = checkoutCounts;
      offline.getQueueCounts('checkin').then(function (checkinCounts) {
        counts.checkin = checkinCounts;
        bus.emit(data.busEvent, counts);
      }, function (err) {
        bus.emit(data.errorEvent, err);
      });
    }, function (err) {
      bus.emit(data.errorEvent, err);
    });
  });

  register(null, {
    offline: offline
  });
};
