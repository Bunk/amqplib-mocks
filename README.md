# `amqplib-mocks`

[![NPM Version][npm-image]][npm-url]
[![Build][ci-image]][ci-url]
[![Coverage][coverage-image]][coverage-url]

A simple mocking framework for amqplib.  Currently supports the following:
* Multiple connections
* Routing messages based on routingKey
* Retrieving any published messages on a channel
* Asserting topology
* The server remotely closing a channel

## Usage

```javascript
const amqplib = require( "amqplib-mocks" );
const proxyquire = require( "proxyquire" );

const server = proxyquire( "./app", { amqplib } );
server.listen();
```
-+++++++
## Example
### app.js
```javascript
'use strict';

const Amqp = require('amqplib');

const url = 'amqp://localhost';
const ex = 'exchange';
const binding_key = '#';

const service = async() => {
  const amqpConn = await Amqp.connect(url);
  const amqpChannel = await amqpConn.createChannel();

  await amqpChannel.assertExchange(ex, 'topic');

  const { queue } = await amqpChannel.assertQueue('', { exclusive: true });
  await amqpChannel.bindQueue(queue, ex, binding_key);

  amqpChannel.publish(ex, binding_key, Buffer.from('hello amqp'));
  amqpChannel.publish(ex, binding_key, Buffer.from('qwerty'));
  amqpChannel.publish(ex, binding_key, Buffer.from('asdf'));
};

module.exports = service;
```

### app.spec.js
```javascript
/* eslint-env node, mocha */
"use strict";
const chai = require('chai');
const expect = chai.expect;

const amqplib = require( "amqplib-mocks" );
const proxyquire = require( "proxyquire" );

const service = proxyquire( "./app", { amqplib } );

const url = 'amqp://localhost';

describe('amqp mock', function () {

  it('receives message', async () => {
      await service();
      const amqpConn = amqplib.getConnection(url);

      const published = amqpConn.getPublished( { bodyTransform: buf => buf.toString() });

      expect( published[0].body ).to.equal('hello amqp');
      expect( published[1].body ).to.equal('qwerty');
      expect( published[2].body ).to.equal('asdf');       
  });

});
```

[npm-image]: https://badge.fury.io/js/amqplib-mocks.svg
[npm-url]: https://npmjs.org/package/amqplib-mocks
[ci-image]: https://travis-ci.org/Bunk/amqplib-mocks.svg?branch=master
[ci-url]: https://travis-ci.org/Bunk/amqplib-mocks
[coverage-image]: https://coveralls.io/repos/github/Bunk/amqplib-mocks/badge.svg
[coverage-url]: https://coveralls.io/github/Bunk/amqplib-mocks
