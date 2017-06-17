const via = require('../')
const TestRunner = require('test-runner')
const a = require('assert')
const Counter = require('test-runner-counter')
const Buffer = require('safe-buffer').Buffer

const runner = new TestRunner()

runner.test('via(func) - utf8', function () {
  const stream = via(data => data + 'yeah?')
  const counter = Counter.create(2)

  stream.on('readable', function () {
    counter.pass()
    const chunk = this.read()
    if (chunk) {
      a.strictEqual(chunk, 'cliveyeah?')
    } else {
      a.strictEqual(chunk, null)
    }
  })
  stream.setEncoding('utf8')
  stream.end('clive')
  return counter.promise
})

runner.test('via.async(func) - utf8', function () {
  const counter = Counter.create(2)
  const stream = via.async((data, enc, done) => {
    process.nextTick(() => {
      done(null, data + 'yeah?')
    })
  })

  stream.on('readable', function () {
    counter.pass()
    const chunk = this.read()
    if (chunk) {
      a.strictEqual(chunk, 'cliveyeah?')
    } else {
      a.strictEqual(chunk, null)
    }
  })
  stream.setEncoding('utf8')
  stream.end('clive')
  return counter.promise
})

runner.test('via(func) - buffer', function () {
  const counter = Counter.create(2)
  const stream = via(function (data) {
    return Buffer.concat([ data, Buffer.from([ 2 ]) ])
  })

  stream.on('readable', function () {
    counter.pass()
    const chunk = this.read()
    if (chunk) {
      a.ok(chunk.equals(Buffer.from([ 1, 2 ])))
    } else {
      a.strictEqual(chunk, null)
    }
  })

  stream.end(Buffer.from([ 1 ]))
  return counter.promise
})

runner.test('through function throws, via emits exception', function () {
  const counter = Counter.create(1)
  const stream = via(function () {
    throw new Error('test')
  })
  stream.on('error', function (err) {
    counter.pass()
    a.strictEqual(err.message, 'test')
  })
  stream.end('data')
  return counter.promise
})

runner.test('async through function returns err, via emits exception', function () {
  const counter = Counter.create(1)
  const stream = via.async(function (chunk, enc, done) {
    done(new Error('test'))
  })
  stream.on('error', function (err) {
    counter.pass()
    a.strictEqual(err.message, 'test')
  })
  stream.end('data')
  return counter.promise
})

runner.test('via: objectMode', function () {
  const counter = Counter.create(2)

  const stream = via(function (object) {
    object.received = true
    return object
  }, { objectMode: true })

  stream.on('readable', function () {
    counter.pass()
    const chunk = this.read()
    if (chunk) {
      a.deepEqual(chunk, { received: true })
    } else {
      a.strictEqual(chunk, null)
    }
  })

  stream.end({})
  return counter.promise
})
