/**
 * @file
 *
 * @TODO: Run check for offline files every time FBS comes online for more than
 *        x mins.
 */

'use strict';

var Queue = require('bull');

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

  this.pause(this.checkinQueue);
  this.pause(this.checkoutQueue);
};

Offline.prototype.isRunning = function isRunning(queue) {
  return !queue.paused;
};

Offline.prototype.pause = function pause(queue) {
  var self = this;
  queue.pause().then(function(){
    self.bus.emit('logger.info', 'Offline queue "' + queue.name + '" is paused.');
  });
};

Offline.prototype.resume = function resume(queue) {
  var self = this;
  queue.resume().then(function(){
    self.bus.emit('logger.info', 'Offline queue "' + queue.name + '" has resumed.');
  });
};

Offline.prototype.add = function add(type, data) {
  console.log('Added - ' + type);
  switch (type) {
    case 'checkin':
      this.checkinQueue.add(data);
      break;

    case 'checkout':
      this.checkoutQueue.add(data);
      break;
  }
};

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
  // this.bus.emit('fbs.checkin', job.data);
  done();
};

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
