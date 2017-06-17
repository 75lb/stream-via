'use strict'
const Transform = require('stream').Transform

/**
 * @module stream-via
 */
module.exports = via
via.async = viaAsync

/**
 * @param {module:stream-via~throughFunction} - a function to process each chunk
 * @param [options] {object} - passed to the returned stream constructor
 * @return {external:Duplex}
 * @alias module:stream-via
 */
function via (throughFunction, options) {
  options = options || {}
  const stream = Transform(options)

  stream._transform = function (chunk, enc, done) {
    if (chunk) {
      try {
        const result = throughFunction(chunk, enc)
        this.push(result)
      } catch (err) {
        stream.emit('error', err)
      }
    }
    done()
  }

  return stream
}

/**
 * @param {module:stream-via~throughFunction} - a function to process each chunk
 * @param [options] {object} - passed to the returned stream constructor
 * @return {external:Duplex}
 * @alias module:stream-via.async
 */
function viaAsync (throughFunction, options) {
  const stream = Transform(options)
  stream._transform = function (chunk, enc, done) {
    if (chunk) {
      try {
        throughFunction(chunk, enc, function (err, returnValue) {
          if (err) {
            stream.emit('error', err)
          } else {
            stream.push(returnValue)
          }
          done()
        })
      } catch (err) {
        stream.emit('error', err)
        done()
      }
    }
  }
  return stream
}

/**
 * @external Duplex
 * @see https://nodejs.org/api/stream.html#stream_class_stream_duplex
 */

/**
 * @typedef throughFunction
 * @type function
 * @param chunk {buffer|string}
 * @param enc {string}
 * @param done {function} - only used in `via.async`, call it like so: `done(err, returnValue)`.
 */
