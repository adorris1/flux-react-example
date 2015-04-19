/**
 * Copyright 2015, Alex Grant, LocalNerve, LLC.
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
'use strict';

var mockery = require('mockery');
var debug = require('debug')('Test:Mocks');
var serviceData = require('../fixtures/service-data');
var serviceMail = require('../fixtures/service-mail');
var superAgent = require('../fixtures/superagent');
var amqplib = require('../fixtures/amqplib');
var cache = require('../fixtures/cache');
var fetch = require('../fixtures/fetch');
var queue = require('../fixtures/queue');
var mailer = require('../fixtures/mailer');

function mockModuleBegin(mocks) {
  mocks.forEach(function(mock) {
    debug('registering mock "' + mock.pattern + '"');
    mockery.registerMock(mock.pattern, mock.module);
  });

  mockery.enable({
    useCleanCache: true,
    warnOnUnregistered: false
  });
}

function mockModuleEnd(mocks) {
  mockery.disable();

  mocks.forEach(function(mock) {
    mockery.deregisterMock(mock.pattern);
  });
}

function mockServiceDataBegin () {
  mockModuleBegin([{
    pattern: './data',
    module: serviceData
  }]);
}

function mockServiceDataEnd () { 
  mockModuleEnd([{
    pattern: './data'
  }]);
}

function mockServiceMailBegin () {
  mockModuleBegin([{
    pattern: './mail',
    module: serviceMail
  }]);
}

function mockServiceMailEnd () {
  mockModuleEnd([{
    pattern: './mail'
  }]);
}

function mockSuperAgentBegin () {
  mockModuleBegin([{
    pattern: 'superagent',
    module: superAgent
  }, {
    pattern: './cache',
    module: cache
  }]);
}

function mockSuperAgentEnd () {
  mockModuleEnd([{
    pattern: 'superagent'
  }, {
    pattern: './cache'
  }]);
}

function mockFetchBegin () {
  mockModuleBegin([{
    pattern: './fetch',
    module: fetch
  }, {
    pattern: './cache',
    module: cache
  }]);
}

function mockFetchEnd () {
  mockModuleEnd([{
    pattern: './fetch'
  }, {
    pattern: './cache'
  }]);
}

function mockMailBegin () {
  mockModuleBegin([{
    pattern: './queue',
    module: queue
  }]);
}

function mockMailEnd () {
  mockModuleEnd([{
    pattern: './queue'
  }]);
}

function mockQueueBegin () {  
  mockModuleBegin([{
    pattern: 'amqplib',
    module: amqplib
  }, {
    pattern: './mailer',
    module: mailer
  }]);
}

function mockQueueEnd () {
  mockModuleEnd([{
    pattern: 'amqplib'
  }, {
    pattern: './mailer'
  }]);
}

module.exports = {
  serviceData: {
    begin: mockServiceDataBegin,
    end: mockServiceDataEnd
  },
  superAgent: {
    begin: mockSuperAgentBegin,
    end: mockSuperAgentEnd
  },
  fetch: {
    begin: mockFetchBegin,
    end: mockFetchEnd
  },
  serviceMail: {
    begin: mockServiceMailBegin,
    end: mockServiceMailEnd
  },
  mail: {
    begin: mockMailBegin,
    end: mockMailEnd
  },
  queue: {
    begin: mockQueueBegin,
    end: mockQueueEnd
  }
};