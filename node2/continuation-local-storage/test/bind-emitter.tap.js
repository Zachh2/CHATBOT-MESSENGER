'use strict';

var test         = require('tap').test
  , EventEmitter = require('events').EventEmitter
  , cls          = require('../context.js')
  ;

test("event emitters bound to CLS context", function (t) {
  t.plan(13);

  t.test("handler registered in context, emit out of context", function (t) {
    t.plan(1);

    var n  = cls.createNamespace('in')
      , ee = new EventEmitter()
      ;

    n.run(function () {
      n.set('value', 'hello');
      n.bindEmitter(ee);
      ee.on('event', function () {
        t.equal(n.get('value'), 'hello', "value still set in EE.");
        cls.destroyNamespace('in');
      });
    });

    ee.emit('event');
  });

  t.test("once handler registered in context", function (t) {
    t.plan(1);

    var n  = cls.createNamespace('inOnce')
      , ee = new EventEmitter()
      ;

    n.run(function () {
      n.set('value', 'hello');
      n.bindEmitter(ee);
      ee.once('event', function () {
        t.equal(n.get('value'), 'hello', "value still set in EE.");
        cls.destroyNamespace('inOnce');
      });
    });

    ee.emit('event');
  });

  t.test("handler registered out of context, emit in context", function (t) {
    t.plan(1);

    var n  = cls.createNamespace('out')
      , ee = new EventEmitter()
      ;

    ee.on('event', function () {
      t.equal(n.get('value'), 'hello', "value still set in EE.");
      cls.destroyNamespace('out');
    });

    n.run(function () {
      n.set('value', 'hello');
      n.bindEmitter(ee);

      ee.emit('event');
    });
  });

  t.test("once handler registered out of context", function (t) {
    t.plan(1);

    var n  = cls.createNamespace('outOnce')
      , ee = new EventEmitter()
      ;

    ee.once('event', function () {
      t.equal(n.get('value'), 'hello', "value still set in EE.");
      cls.destroyNamespace('outOnce');
    });

    n.run(function () {
      n.set('value', 'hello');
      n.bindEmitter(ee);

      ee.emit('event');
    });
  });

  t.test("handler registered out of context, emit out of context", function (t) {
    t.plan(1);

    var n  = cls.createNamespace('out')
      , ee = new EventEmitter()
      ;

    ee.on('event', function () {
      t.equal(n.get('value'), undefined, "no context.");
      cls.destroyNamespace('out');
    });

    n.run(function () {
      n.set('value', 'hello');
      n.bindEmitter(ee);
    });

    ee.emit('event');
  });

  t.test("once handler registered out of context on Readable", function (t) {
    var Readable = require('stream').Readable;

    if (Readable) {
      t.plan(12);

      var n  = cls.createNamespace('outOnceReadable')
        , re = new Readable()
        ;

      re._read = function () {};

      t.ok(n.name, "namespace has a name");
      t.equal(n.name, 'outOnceReadable', "namespace has a name");

      re.once('data', function (data) {
        t.equal(n.get('value'), 'hello', "value still set in EE");
        t.equal(data, 'blah', "emit still works");
        cls.destroyNamespace('outOnceReadable');
      });

      n.run(function () {
        n.set('value', 'hello');

        t.notOk(re.emit.__wrapped, "emit is not wrapped");
        t.notOk(re.on.__wrapped, "on is not wrapped");
        t.notOk(re.addListener.__wrapped, "addListener is not wrapped");

        n.bindEmitter(re);

        t.ok(re.emit.__wrapped, "emit is wrapped");
        t.ok(re.on.__wrapped, "on is wrapped");
        t.ok(re.addListener.__wrapped, "addListener is wrapped");

        t.equal(typeof re._events.data, 'function', 'only the one data listener');
        t.notOk(re._events.data['context@outOnceReadable'], "context isn't on listener");

        re.emit('data', 'blah');
      });
    }
    else {
      t.comment("this test requires node 0.10+");
      t.end();
    }
  });

  t.test("emitter with newListener that removes handler", function (t) {
    t.plan(3);

    var n  = cls.createNamespace('newListener')
      , ee = new EventEmitter()
      ;

    // add monkeypatching to ee
    n.bindEmitter(ee);

    function listen() {
      ee.on('data', function (chunk) {
        t.equal(chunk, 'chunk', 'listener still works');
      });
    }

    ee.on('newListener', function handler(event) {
      if (event !== 'data') return;

      this.removeListener('newListener', handler);
      t.notOk(this.listeners('newListener').length, 'newListener was removed');
      process.nextTick(listen);
    });

    ee.on('drain', function (chunk) {
      process.nextTick(function () {
        ee.emit('data', chunk);
      });
    });

    ee.on('data', function (chunk) {
      t.equal(chunk, 'chunk', 'got data event');
      cls.destroyNamespace('newListener');
    });

    ee.emit('drain', 'chunk');
  });

  t.test("handler registered in context on Readable", function (t) {
    var Readable = require('stream').Readable;

    if (Readable) {
      t.plan(12);

      var n  = cls.createNamespace('outOnReadable')
        , re = new Readable()
        ;

      re._read = function () {};

      t.ok(n.name, "namespace has a name");
      t.equal(n.name, 'outOnReadable', "namespace has a name");

      n.run(function () {
        n.set('value', 'hello');

        n.bindEmitter(re);

        t.ok(re.emit.__wrapped, "emit is wrapped");
        t.ok(re.on.__wrapped, "on is wrapped");
        t.ok(re.addListener.__wrapped, "addListener is wrapped");

        re.on('data', function (data) {
          t.equal(n.get('value'), 'hello', "value still set in EE");
          t.equal(data, 'blah', "emit still works");
          cls.destroyNamespace('outOnReadable');
        });
      });

      t.ok(re.emit.__wrapped, "emit is still wrapped");
      t.ok(re.on.__wrapped, "on is still wrapped");
      t.ok(re.addListener.__wrapped, "addListener is still wrapped");

      t.equal(typeof re._events.data, 'function', 'only the one data listener');
      t.ok(re._events.data['cls@contexts']['context@outOnReadable'],
           "context is bound to listener");

      re.emit('data', 'blah');
    }
    else {
      t.comment("this test requires node 0.10+");
      t.end();
    }
  });

  t.test("handler added but used entirely out of context", function (t) {
    t.plan(2);

    var n  = cls.createNamespace('none')
      , ee = new EventEmitter()
      ;

    n.run(function () {
      n.set('value', 'hello');
      n.bindEmitter(ee);
    });

    ee.on('event', function () {
      t.ok(n, "n is set");
      t.notOk(n.get('value'), "value shouldn't be visible");
      cls.destroyNamespace('none');
    });

    ee.emit('event');
  });

  t.test("handler added but no listeners registered", function (t) {
    t.plan(3);

    var http = require('http')
      , n  = cls.createNamespace('no_listener')
      ;

    // only fails on Node < 0.10
    var server = http.createServer(function (req, res) {
      n.bindEmitter(req);

      t.doesNotThrow(function () {
        req.emit('event');
      });

      res.writeHead(200, {"Content-Length" : 4});
      res.end('WORD');
    });
    server.listen(8080);

    http.get('http://localhost:8080/', function (res) {
      t.equal(res.statusCode, 200, "request came back OK");

      res.setEncoding('ascii');
      res.on('data', function (body) {
        t.equal(body, 'WORD');

        server.close();
        cls.destroyNamespace('no_listener');
      });
    });
  });

  t.test("listener with parameters added but not bound to context", function (t) {
    t.plan(2);

    var ee = new EventEmitter()
      , n  = cls.createNamespace('param_list')
      ;

    function sent(value) {
      t.equal(value, 3, "sent value is correct");
      cls.destroyNamespace('param_list');
    }

    ee.on('send', sent);
    n.bindEmitter(ee);
    t.doesNotThrow(function () {
      ee.emit('send', 3);
    });
  });

  t.test("listener that throws doesn't leave removeListener wrapped", function (t) {
    t.plan(4);

    var ee = new EventEmitter()
      , n  = cls.createNamespace('kaboom')
      ;

    n.bindEmitter(ee);

    function kaboom() {
      throw new Error('whoops');
    }

    n.run(function () {
      ee.on('bad', kaboom);

      t.throws(function () { ee.emit('bad'); });
      t.equal(typeof ee.removeListener, 'function', 'removeListener is still there');
      t.notOk(ee.removeListener.__wrapped, "removeListener got unwrapped");
      t.equal(ee._events.bad, kaboom, "listener isn't still bound");
      cls.destroyNamespace('kaboom');
    });
  });

  t.test("emitter bound to multiple namespaces handles them correctly", function (t) {
    t.plan(8);

    var ee = new EventEmitter()
      , ns1 = cls.createNamespace('1')
      , ns2 = cls.createNamespace('2')
      ;

    // emulate an incoming data emitter
    setTimeout(function () {
      ee.emit('data', 'hi');
    }, 10);

    t.doesNotThrow(function () { ns1.bindEmitter(ee); });
    t.doesNotThrow(function () { ns2.bindEmitter(ee); });

    ns1.run(function () {
      ns2.run(function () {
        ns1.set('name', 'tom1');
        ns2.set('name', 'tom2');

        t.doesNotThrow(function () { ns1.bindEmitter(ee); });
        t.doesNotThrow(function () { ns2.bindEmitter(ee); });

        ns1.run(function () {
          process.nextTick(function () {
            t.equal(ns1.get('name'), 'tom1', "ns1 value correct");
            t.equal(ns2.get('name'), 'tom2', "ns2 value correct");

            ns1.set('name', 'bob');
            ns2.set('name', 'alice');

            ee.on('data', function () {
              t.equal(ns1.get('name'), 'bob',   "ns1 value bound onto emitter");
              t.equal(ns2.get('name'), 'alice', "ns2 value bound onto emitter");
            });
          });
        });
      });
    });
  });
});
