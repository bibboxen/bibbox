/**
 * @file
 *
 * @TODO: Run check for offline files every time FBS comes online for more than
 *        x mins.
 */

'use strict';

var Queue = require('bull');
var Q = require('q');

// Global self is used be queued jobs to get access to the bus.
var self = null;

/**
 *
 * @constructor
 */
var Offline = function Offline(bus, host, port) {
  self = this;

  this.bus = bus;

  this.checkinQueue = Queue('Check-in', port, host);
  this.checkoutQueue = Queue('Check-out', port, host);

  this.checkinQueue.process(this.checkin);
  this.checkoutQueue.process(this.checkout);

  this.pause('checkin');
  this.pause('checkout');
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
 * Check if a queue is running.
 *
 * @param type
 *  The type of queue (checkin or checkout).
 *
 * @returns {boolean}
 *   TRUE if it's running else FALSE.
 */
Offline.prototype.isRunning = function isRunning(type) {
  var queue = this._findQueue(type);

  return !queue.paused;
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

  queue.pause().then(function(){
    self.bus.emit('logger.info', 'Offline queue "' + queue.name + '" is paused.');
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

  queue.resume().then(function(){
    self.bus.emit('logger.info', 'Offline queue "' + queue.name + '" has resumed.');
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

  queue.add(data).then(function (job) {
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

  self.bus.on(data.busEvent, function (res) {
    done();
  });

  self.bus.on(job.errorEvent, function (err) {
     // Log the failure.
     self.bus.emit('logger.offline', 'error: ' + err.message);
     done(err);
  });

  console.log(job);

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

  self.bus.once(data.busEvent, function (res) {
    console.log(res);
    if (res.ok == '0') {
      done(new Error(res.screenMessage));
    }
    else {
      self.bus.emit('logger.offline', 'data: ' + res);
      done(null, res);
    }
  });

  self.bus.once(data.errorEvent, function (err) {
    // Log the failure.
    self.bus.emit('logger.offline', 'error: ' + err.message);
    done(err);
  });

  // Send request to FBS.
  self.bus.emit('fbs.checkout', data);
};

/**
 * Register the plugin with architect.
 */
module.exports = function (options, imports, register) {
  var bus = imports.bus;
  var offline = new Offline(bus, options.host, options.port);

  bus.on('offline.add.checkout', function (data) {
    // Added event info to job.
    data.busEvent = 'offline.fbs.checkout.success' + data.itemIdentifier;
    data.errorEvent = 'offline.fbs.checkout.error' + data.itemIdentifier;
    data.queued = true;

    offline.add('checkout', data);
  });

  bus.on('offline.add.checkin', function (data) {
    // Added event info to job.
    data.busEvent = 'offline.fbs.checkin.success' + data.itemIdentifier;
    data.errorEvent = 'offline.fbs.checkin.error' + data.itemIdentifier;
    data.queued = true;

    offline.add('checkin', data);
  });

  register(null, {
    offline: offline
  });
};
