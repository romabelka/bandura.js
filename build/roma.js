(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */

var base64 = require('base64-js')
var ieee754 = require('ieee754')

exports.Buffer = Buffer
exports.SlowBuffer = Buffer
exports.INSPECT_MAX_BYTES = 50
Buffer.poolSize = 8192

/**
 * If `Buffer._useTypedArrays`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (compatible down to IE6)
 */
Buffer._useTypedArrays = (function () {
  // Detect if browser supports Typed Arrays. Supported browsers are IE 10+, Firefox 4+,
  // Chrome 7+, Safari 5.1+, Opera 11.6+, iOS 4.2+. If the browser does not support adding
  // properties to `Uint8Array` instances, then that's the same as no `Uint8Array` support
  // because we need to be able to add all the node Buffer API methods. This is an issue
  // in Firefox 4-29. Now fixed: https://bugzilla.mozilla.org/show_bug.cgi?id=695438
  try {
    var buf = new ArrayBuffer(0)
    var arr = new Uint8Array(buf)
    arr.foo = function () { return 42 }
    return 42 === arr.foo() &&
        typeof arr.subarray === 'function' // Chrome 9-10 lack `subarray`
  } catch (e) {
    return false
  }
})()

/**
 * Class: Buffer
 * =============
 *
 * The Buffer constructor returns instances of `Uint8Array` that are augmented
 * with function properties for all the node `Buffer` API functions. We use
 * `Uint8Array` so that square bracket notation works as expected -- it returns
 * a single octet.
 *
 * By augmenting the instances, we can avoid modifying the `Uint8Array`
 * prototype.
 */
function Buffer (subject, encoding, noZero) {
  if (!(this instanceof Buffer))
    return new Buffer(subject, encoding, noZero)

  var type = typeof subject

  // Workaround: node's base64 implementation allows for non-padded strings
  // while base64-js does not.
  if (encoding === 'base64' && type === 'string') {
    subject = stringtrim(subject)
    while (subject.length % 4 !== 0) {
      subject = subject + '='
    }
  }

  // Find the length
  var length
  if (type === 'number')
    length = coerce(subject)
  else if (type === 'string')
    length = Buffer.byteLength(subject, encoding)
  else if (type === 'object')
    length = coerce(subject.length) // assume that object is array-like
  else
    throw new Error('First argument needs to be a number, array or string.')

  var buf
  if (Buffer._useTypedArrays) {
    // Preferred: Return an augmented `Uint8Array` instance for best performance
    buf = Buffer._augment(new Uint8Array(length))
  } else {
    // Fallback: Return THIS instance of Buffer (created by `new`)
    buf = this
    buf.length = length
    buf._isBuffer = true
  }

  var i
  if (Buffer._useTypedArrays && typeof subject.byteLength === 'number') {
    // Speed optimization -- use set if we're copying from a typed array
    buf._set(subject)
  } else if (isArrayish(subject)) {
    // Treat array-ish objects as a byte array
    for (i = 0; i < length; i++) {
      if (Buffer.isBuffer(subject))
        buf[i] = subject.readUInt8(i)
      else
        buf[i] = subject[i]
    }
  } else if (type === 'string') {
    buf.write(subject, 0, encoding)
  } else if (type === 'number' && !Buffer._useTypedArrays && !noZero) {
    for (i = 0; i < length; i++) {
      buf[i] = 0
    }
  }

  return buf
}

// STATIC METHODS
// ==============

Buffer.isEncoding = function (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'binary':
    case 'base64':
    case 'raw':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.isBuffer = function (b) {
  return !!(b !== null && b !== undefined && b._isBuffer)
}

Buffer.byteLength = function (str, encoding) {
  var ret
  str = str + ''
  switch (encoding || 'utf8') {
    case 'hex':
      ret = str.length / 2
      break
    case 'utf8':
    case 'utf-8':
      ret = utf8ToBytes(str).length
      break
    case 'ascii':
    case 'binary':
    case 'raw':
      ret = str.length
      break
    case 'base64':
      ret = base64ToBytes(str).length
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = str.length * 2
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.concat = function (list, totalLength) {
  assert(isArray(list), 'Usage: Buffer.concat(list, [totalLength])\n' +
      'list should be an Array.')

  if (list.length === 0) {
    return new Buffer(0)
  } else if (list.length === 1) {
    return list[0]
  }

  var i
  if (typeof totalLength !== 'number') {
    totalLength = 0
    for (i = 0; i < list.length; i++) {
      totalLength += list[i].length
    }
  }

  var buf = new Buffer(totalLength)
  var pos = 0
  for (i = 0; i < list.length; i++) {
    var item = list[i]
    item.copy(buf, pos)
    pos += item.length
  }
  return buf
}

// BUFFER INSTANCE METHODS
// =======================

function _hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  assert(strLen % 2 === 0, 'Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; i++) {
    var byte = parseInt(string.substr(i * 2, 2), 16)
    assert(!isNaN(byte), 'Invalid hex string')
    buf[offset + i] = byte
  }
  Buffer._charsWritten = i * 2
  return i
}

function _utf8Write (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(utf8ToBytes(string), buf, offset, length)
  return charsWritten
}

function _asciiWrite (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(asciiToBytes(string), buf, offset, length)
  return charsWritten
}

function _binaryWrite (buf, string, offset, length) {
  return _asciiWrite(buf, string, offset, length)
}

function _base64Write (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(base64ToBytes(string), buf, offset, length)
  return charsWritten
}

function _utf16leWrite (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(utf16leToBytes(string), buf, offset, length)
  return charsWritten
}

Buffer.prototype.write = function (string, offset, length, encoding) {
  // Support both (string, offset, length, encoding)
  // and the legacy (string, encoding, offset, length)
  if (isFinite(offset)) {
    if (!isFinite(length)) {
      encoding = length
      length = undefined
    }
  } else {  // legacy
    var swap = encoding
    encoding = offset
    offset = length
    length = swap
  }

  offset = Number(offset) || 0
  var remaining = this.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }
  encoding = String(encoding || 'utf8').toLowerCase()

  var ret
  switch (encoding) {
    case 'hex':
      ret = _hexWrite(this, string, offset, length)
      break
    case 'utf8':
    case 'utf-8':
      ret = _utf8Write(this, string, offset, length)
      break
    case 'ascii':
      ret = _asciiWrite(this, string, offset, length)
      break
    case 'binary':
      ret = _binaryWrite(this, string, offset, length)
      break
    case 'base64':
      ret = _base64Write(this, string, offset, length)
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = _utf16leWrite(this, string, offset, length)
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.prototype.toString = function (encoding, start, end) {
  var self = this

  encoding = String(encoding || 'utf8').toLowerCase()
  start = Number(start) || 0
  end = (end !== undefined)
    ? Number(end)
    : end = self.length

  // Fastpath empty strings
  if (end === start)
    return ''

  var ret
  switch (encoding) {
    case 'hex':
      ret = _hexSlice(self, start, end)
      break
    case 'utf8':
    case 'utf-8':
      ret = _utf8Slice(self, start, end)
      break
    case 'ascii':
      ret = _asciiSlice(self, start, end)
      break
    case 'binary':
      ret = _binarySlice(self, start, end)
      break
    case 'base64':
      ret = _base64Slice(self, start, end)
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = _utf16leSlice(self, start, end)
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.prototype.toJSON = function () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function (target, target_start, start, end) {
  var source = this

  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (!target_start) target_start = 0

  // Copy 0 bytes; we're done
  if (end === start) return
  if (target.length === 0 || source.length === 0) return

  // Fatal error conditions
  assert(end >= start, 'sourceEnd < sourceStart')
  assert(target_start >= 0 && target_start < target.length,
      'targetStart out of bounds')
  assert(start >= 0 && start < source.length, 'sourceStart out of bounds')
  assert(end >= 0 && end <= source.length, 'sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length)
    end = this.length
  if (target.length - target_start < end - start)
    end = target.length - target_start + start

  var len = end - start

  if (len < 100 || !Buffer._useTypedArrays) {
    for (var i = 0; i < len; i++)
      target[i + target_start] = this[i + start]
  } else {
    target._set(this.subarray(start, start + len), target_start)
  }
}

function _base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function _utf8Slice (buf, start, end) {
  var res = ''
  var tmp = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    if (buf[i] <= 0x7F) {
      res += decodeUtf8Char(tmp) + String.fromCharCode(buf[i])
      tmp = ''
    } else {
      tmp += '%' + buf[i].toString(16)
    }
  }

  return res + decodeUtf8Char(tmp)
}

function _asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++)
    ret += String.fromCharCode(buf[i])
  return ret
}

function _binarySlice (buf, start, end) {
  return _asciiSlice(buf, start, end)
}

function _hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; i++) {
    out += toHex(buf[i])
  }
  return out
}

function _utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i+1] * 256)
  }
  return res
}

Buffer.prototype.slice = function (start, end) {
  var len = this.length
  start = clamp(start, len, 0)
  end = clamp(end, len, len)

  if (Buffer._useTypedArrays) {
    return Buffer._augment(this.subarray(start, end))
  } else {
    var sliceLen = end - start
    var newBuf = new Buffer(sliceLen, undefined, true)
    for (var i = 0; i < sliceLen; i++) {
      newBuf[i] = this[i + start]
    }
    return newBuf
  }
}

// `get` will be removed in Node 0.13+
Buffer.prototype.get = function (offset) {
  console.log('.get() is deprecated. Access using array indexes instead.')
  return this.readUInt8(offset)
}

// `set` will be removed in Node 0.13+
Buffer.prototype.set = function (v, offset) {
  console.log('.set() is deprecated. Access using array indexes instead.')
  return this.writeUInt8(v, offset)
}

Buffer.prototype.readUInt8 = function (offset, noAssert) {
  if (!noAssert) {
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'Trying to read beyond buffer length')
  }

  if (offset >= this.length)
    return

  return this[offset]
}

function _readUInt16 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val
  if (littleEndian) {
    val = buf[offset]
    if (offset + 1 < len)
      val |= buf[offset + 1] << 8
  } else {
    val = buf[offset] << 8
    if (offset + 1 < len)
      val |= buf[offset + 1]
  }
  return val
}

Buffer.prototype.readUInt16LE = function (offset, noAssert) {
  return _readUInt16(this, offset, true, noAssert)
}

Buffer.prototype.readUInt16BE = function (offset, noAssert) {
  return _readUInt16(this, offset, false, noAssert)
}

function _readUInt32 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val
  if (littleEndian) {
    if (offset + 2 < len)
      val = buf[offset + 2] << 16
    if (offset + 1 < len)
      val |= buf[offset + 1] << 8
    val |= buf[offset]
    if (offset + 3 < len)
      val = val + (buf[offset + 3] << 24 >>> 0)
  } else {
    if (offset + 1 < len)
      val = buf[offset + 1] << 16
    if (offset + 2 < len)
      val |= buf[offset + 2] << 8
    if (offset + 3 < len)
      val |= buf[offset + 3]
    val = val + (buf[offset] << 24 >>> 0)
  }
  return val
}

Buffer.prototype.readUInt32LE = function (offset, noAssert) {
  return _readUInt32(this, offset, true, noAssert)
}

Buffer.prototype.readUInt32BE = function (offset, noAssert) {
  return _readUInt32(this, offset, false, noAssert)
}

Buffer.prototype.readInt8 = function (offset, noAssert) {
  if (!noAssert) {
    assert(offset !== undefined && offset !== null,
        'missing offset')
    assert(offset < this.length, 'Trying to read beyond buffer length')
  }

  if (offset >= this.length)
    return

  var neg = this[offset] & 0x80
  if (neg)
    return (0xff - this[offset] + 1) * -1
  else
    return this[offset]
}

function _readInt16 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val = _readUInt16(buf, offset, littleEndian, true)
  var neg = val & 0x8000
  if (neg)
    return (0xffff - val + 1) * -1
  else
    return val
}

Buffer.prototype.readInt16LE = function (offset, noAssert) {
  return _readInt16(this, offset, true, noAssert)
}

Buffer.prototype.readInt16BE = function (offset, noAssert) {
  return _readInt16(this, offset, false, noAssert)
}

function _readInt32 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val = _readUInt32(buf, offset, littleEndian, true)
  var neg = val & 0x80000000
  if (neg)
    return (0xffffffff - val + 1) * -1
  else
    return val
}

Buffer.prototype.readInt32LE = function (offset, noAssert) {
  return _readInt32(this, offset, true, noAssert)
}

Buffer.prototype.readInt32BE = function (offset, noAssert) {
  return _readInt32(this, offset, false, noAssert)
}

function _readFloat (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  return ieee754.read(buf, offset, littleEndian, 23, 4)
}

Buffer.prototype.readFloatLE = function (offset, noAssert) {
  return _readFloat(this, offset, true, noAssert)
}

Buffer.prototype.readFloatBE = function (offset, noAssert) {
  return _readFloat(this, offset, false, noAssert)
}

function _readDouble (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset + 7 < buf.length, 'Trying to read beyond buffer length')
  }

  return ieee754.read(buf, offset, littleEndian, 52, 8)
}

Buffer.prototype.readDoubleLE = function (offset, noAssert) {
  return _readDouble(this, offset, true, noAssert)
}

Buffer.prototype.readDoubleBE = function (offset, noAssert) {
  return _readDouble(this, offset, false, noAssert)
}

Buffer.prototype.writeUInt8 = function (value, offset, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'trying to write beyond buffer length')
    verifuint(value, 0xff)
  }

  if (offset >= this.length) return

  this[offset] = value
}

function _writeUInt16 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'trying to write beyond buffer length')
    verifuint(value, 0xffff)
  }

  var len = buf.length
  if (offset >= len)
    return

  for (var i = 0, j = Math.min(len - offset, 2); i < j; i++) {
    buf[offset + i] =
        (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
            (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function (value, offset, noAssert) {
  _writeUInt16(this, value, offset, true, noAssert)
}

Buffer.prototype.writeUInt16BE = function (value, offset, noAssert) {
  _writeUInt16(this, value, offset, false, noAssert)
}

function _writeUInt32 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'trying to write beyond buffer length')
    verifuint(value, 0xffffffff)
  }

  var len = buf.length
  if (offset >= len)
    return

  for (var i = 0, j = Math.min(len - offset, 4); i < j; i++) {
    buf[offset + i] =
        (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function (value, offset, noAssert) {
  _writeUInt32(this, value, offset, true, noAssert)
}

Buffer.prototype.writeUInt32BE = function (value, offset, noAssert) {
  _writeUInt32(this, value, offset, false, noAssert)
}

Buffer.prototype.writeInt8 = function (value, offset, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7f, -0x80)
  }

  if (offset >= this.length)
    return

  if (value >= 0)
    this.writeUInt8(value, offset, noAssert)
  else
    this.writeUInt8(0xff + value + 1, offset, noAssert)
}

function _writeInt16 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7fff, -0x8000)
  }

  var len = buf.length
  if (offset >= len)
    return

  if (value >= 0)
    _writeUInt16(buf, value, offset, littleEndian, noAssert)
  else
    _writeUInt16(buf, 0xffff + value + 1, offset, littleEndian, noAssert)
}

Buffer.prototype.writeInt16LE = function (value, offset, noAssert) {
  _writeInt16(this, value, offset, true, noAssert)
}

Buffer.prototype.writeInt16BE = function (value, offset, noAssert) {
  _writeInt16(this, value, offset, false, noAssert)
}

function _writeInt32 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7fffffff, -0x80000000)
  }

  var len = buf.length
  if (offset >= len)
    return

  if (value >= 0)
    _writeUInt32(buf, value, offset, littleEndian, noAssert)
  else
    _writeUInt32(buf, 0xffffffff + value + 1, offset, littleEndian, noAssert)
}

Buffer.prototype.writeInt32LE = function (value, offset, noAssert) {
  _writeInt32(this, value, offset, true, noAssert)
}

Buffer.prototype.writeInt32BE = function (value, offset, noAssert) {
  _writeInt32(this, value, offset, false, noAssert)
}

function _writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to write beyond buffer length')
    verifIEEE754(value, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }

  var len = buf.length
  if (offset >= len)
    return

  ieee754.write(buf, value, offset, littleEndian, 23, 4)
}

Buffer.prototype.writeFloatLE = function (value, offset, noAssert) {
  _writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function (value, offset, noAssert) {
  _writeFloat(this, value, offset, false, noAssert)
}

function _writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 7 < buf.length,
        'Trying to write beyond buffer length')
    verifIEEE754(value, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }

  var len = buf.length
  if (offset >= len)
    return

  ieee754.write(buf, value, offset, littleEndian, 52, 8)
}

Buffer.prototype.writeDoubleLE = function (value, offset, noAssert) {
  _writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function (value, offset, noAssert) {
  _writeDouble(this, value, offset, false, noAssert)
}

// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function (value, start, end) {
  if (!value) value = 0
  if (!start) start = 0
  if (!end) end = this.length

  if (typeof value === 'string') {
    value = value.charCodeAt(0)
  }

  assert(typeof value === 'number' && !isNaN(value), 'value is not a number')
  assert(end >= start, 'end < start')

  // Fill 0 bytes; we're done
  if (end === start) return
  if (this.length === 0) return

  assert(start >= 0 && start < this.length, 'start out of bounds')
  assert(end >= 0 && end <= this.length, 'end out of bounds')

  for (var i = start; i < end; i++) {
    this[i] = value
  }
}

Buffer.prototype.inspect = function () {
  var out = []
  var len = this.length
  for (var i = 0; i < len; i++) {
    out[i] = toHex(this[i])
    if (i === exports.INSPECT_MAX_BYTES) {
      out[i + 1] = '...'
      break
    }
  }
  return '<Buffer ' + out.join(' ') + '>'
}

/**
 * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
 * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
 */
Buffer.prototype.toArrayBuffer = function () {
  if (typeof Uint8Array !== 'undefined') {
    if (Buffer._useTypedArrays) {
      return (new Buffer(this)).buffer
    } else {
      var buf = new Uint8Array(this.length)
      for (var i = 0, len = buf.length; i < len; i += 1)
        buf[i] = this[i]
      return buf.buffer
    }
  } else {
    throw new Error('Buffer.toArrayBuffer not supported in this browser')
  }
}

// HELPER FUNCTIONS
// ================

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

var BP = Buffer.prototype

/**
 * Augment a Uint8Array *instance* (not the Uint8Array class!) with Buffer methods
 */
Buffer._augment = function (arr) {
  arr._isBuffer = true

  // save reference to original Uint8Array get/set methods before overwriting
  arr._get = arr.get
  arr._set = arr.set

  // deprecated, will be removed in node 0.13+
  arr.get = BP.get
  arr.set = BP.set

  arr.write = BP.write
  arr.toString = BP.toString
  arr.toLocaleString = BP.toString
  arr.toJSON = BP.toJSON
  arr.copy = BP.copy
  arr.slice = BP.slice
  arr.readUInt8 = BP.readUInt8
  arr.readUInt16LE = BP.readUInt16LE
  arr.readUInt16BE = BP.readUInt16BE
  arr.readUInt32LE = BP.readUInt32LE
  arr.readUInt32BE = BP.readUInt32BE
  arr.readInt8 = BP.readInt8
  arr.readInt16LE = BP.readInt16LE
  arr.readInt16BE = BP.readInt16BE
  arr.readInt32LE = BP.readInt32LE
  arr.readInt32BE = BP.readInt32BE
  arr.readFloatLE = BP.readFloatLE
  arr.readFloatBE = BP.readFloatBE
  arr.readDoubleLE = BP.readDoubleLE
  arr.readDoubleBE = BP.readDoubleBE
  arr.writeUInt8 = BP.writeUInt8
  arr.writeUInt16LE = BP.writeUInt16LE
  arr.writeUInt16BE = BP.writeUInt16BE
  arr.writeUInt32LE = BP.writeUInt32LE
  arr.writeUInt32BE = BP.writeUInt32BE
  arr.writeInt8 = BP.writeInt8
  arr.writeInt16LE = BP.writeInt16LE
  arr.writeInt16BE = BP.writeInt16BE
  arr.writeInt32LE = BP.writeInt32LE
  arr.writeInt32BE = BP.writeInt32BE
  arr.writeFloatLE = BP.writeFloatLE
  arr.writeFloatBE = BP.writeFloatBE
  arr.writeDoubleLE = BP.writeDoubleLE
  arr.writeDoubleBE = BP.writeDoubleBE
  arr.fill = BP.fill
  arr.inspect = BP.inspect
  arr.toArrayBuffer = BP.toArrayBuffer

  return arr
}

// slice(start, end)
function clamp (index, len, defaultValue) {
  if (typeof index !== 'number') return defaultValue
  index = ~~index;  // Coerce to integer.
  if (index >= len) return len
  if (index >= 0) return index
  index += len
  if (index >= 0) return index
  return 0
}

function coerce (length) {
  // Coerce length to a number (possibly NaN), round up
  // in case it's fractional (e.g. 123.456) then do a
  // double negate to coerce a NaN to 0. Easy, right?
  length = ~~Math.ceil(+length)
  return length < 0 ? 0 : length
}

function isArray (subject) {
  return (Array.isArray || function (subject) {
    return Object.prototype.toString.call(subject) === '[object Array]'
  })(subject)
}

function isArrayish (subject) {
  return isArray(subject) || Buffer.isBuffer(subject) ||
      subject && typeof subject === 'object' &&
      typeof subject.length === 'number'
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    var b = str.charCodeAt(i)
    if (b <= 0x7F)
      byteArray.push(str.charCodeAt(i))
    else {
      var start = i
      if (b >= 0xD800 && b <= 0xDFFF) i++
      var h = encodeURIComponent(str.slice(start, i+1)).substr(1).split('%')
      for (var j = 0; j < h.length; j++)
        byteArray.push(parseInt(h[j], 16))
    }
  }
  return byteArray
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(str)
}

function blitBuffer (src, dst, offset, length) {
  var pos
  for (var i = 0; i < length; i++) {
    if ((i + offset >= dst.length) || (i >= src.length))
      break
    dst[i + offset] = src[i]
  }
  return i
}

function decodeUtf8Char (str) {
  try {
    return decodeURIComponent(str)
  } catch (err) {
    return String.fromCharCode(0xFFFD) // UTF 8 invalid char
  }
}

/*
 * We have to make sure that the value is a valid integer. This means that it
 * is non-negative. It has no fractional component and that it does not
 * exceed the maximum allowed value.
 */
function verifuint (value, max) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value >= 0, 'specified a negative value for writing an unsigned value')
  assert(value <= max, 'value is larger than maximum value for type')
  assert(Math.floor(value) === value, 'value has a fractional component')
}

function verifsint (value, max, min) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value <= max, 'value larger than maximum allowed value')
  assert(value >= min, 'value smaller than minimum allowed value')
  assert(Math.floor(value) === value, 'value has a fractional component')
}

function verifIEEE754 (value, max, min) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value <= max, 'value larger than maximum allowed value')
  assert(value >= min, 'value smaller than minimum allowed value')
}

function assert (test, message) {
  if (!test) throw new Error(message || 'Failed assertion')
}

}).call(this,require("1YiZ5S"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../node_modules/gulp-browserify/node_modules/browserify/node_modules/buffer/index.js","/../node_modules/gulp-browserify/node_modules/browserify/node_modules/buffer")
},{"1YiZ5S":4,"base64-js":2,"buffer":1,"ieee754":3}],2:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

;(function (exports) {
	'use strict';

  var Arr = (typeof Uint8Array !== 'undefined')
    ? Uint8Array
    : Array

	var PLUS   = '+'.charCodeAt(0)
	var SLASH  = '/'.charCodeAt(0)
	var NUMBER = '0'.charCodeAt(0)
	var LOWER  = 'a'.charCodeAt(0)
	var UPPER  = 'A'.charCodeAt(0)
	var PLUS_URL_SAFE = '-'.charCodeAt(0)
	var SLASH_URL_SAFE = '_'.charCodeAt(0)

	function decode (elt) {
		var code = elt.charCodeAt(0)
		if (code === PLUS ||
		    code === PLUS_URL_SAFE)
			return 62 // '+'
		if (code === SLASH ||
		    code === SLASH_URL_SAFE)
			return 63 // '/'
		if (code < NUMBER)
			return -1 //no match
		if (code < NUMBER + 10)
			return code - NUMBER + 26 + 26
		if (code < UPPER + 26)
			return code - UPPER
		if (code < LOWER + 26)
			return code - LOWER + 26
	}

	function b64ToByteArray (b64) {
		var i, j, l, tmp, placeHolders, arr

		if (b64.length % 4 > 0) {
			throw new Error('Invalid string. Length must be a multiple of 4')
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		var len = b64.length
		placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0

		// base64 is 4/3 + up to two characters of the original data
		arr = new Arr(b64.length * 3 / 4 - placeHolders)

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length

		var L = 0

		function push (v) {
			arr[L++] = v
		}

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
			push((tmp & 0xFF0000) >> 16)
			push((tmp & 0xFF00) >> 8)
			push(tmp & 0xFF)
		}

		if (placeHolders === 2) {
			tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
			push(tmp & 0xFF)
		} else if (placeHolders === 1) {
			tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
			push((tmp >> 8) & 0xFF)
			push(tmp & 0xFF)
		}

		return arr
	}

	function uint8ToBase64 (uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length

		function encode (num) {
			return lookup.charAt(num)
		}

		function tripletToBase64 (num) {
			return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
		}

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
			output += tripletToBase64(temp)
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1]
				output += encode(temp >> 2)
				output += encode((temp << 4) & 0x3F)
				output += '=='
				break
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
				output += encode(temp >> 10)
				output += encode((temp >> 4) & 0x3F)
				output += encode((temp << 2) & 0x3F)
				output += '='
				break
		}

		return output
	}

	exports.toByteArray = b64ToByteArray
	exports.fromByteArray = uint8ToBase64
}(typeof exports === 'undefined' ? (this.base64js = {}) : exports))

}).call(this,require("1YiZ5S"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../node_modules/gulp-browserify/node_modules/browserify/node_modules/buffer/node_modules/base64-js/lib/b64.js","/../node_modules/gulp-browserify/node_modules/browserify/node_modules/buffer/node_modules/base64-js/lib")
},{"1YiZ5S":4,"buffer":1}],3:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
exports.read = function(buffer, offset, isLE, mLen, nBytes) {
  var e, m,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      nBits = -7,
      i = isLE ? (nBytes - 1) : 0,
      d = isLE ? -1 : 1,
      s = buffer[offset + i];

  i += d;

  e = s & ((1 << (-nBits)) - 1);
  s >>= (-nBits);
  nBits += eLen;
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8);

  m = e & ((1 << (-nBits)) - 1);
  e >>= (-nBits);
  nBits += mLen;
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8);

  if (e === 0) {
    e = 1 - eBias;
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity);
  } else {
    m = m + Math.pow(2, mLen);
    e = e - eBias;
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
};

exports.write = function(buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0),
      i = isLE ? 0 : (nBytes - 1),
      d = isLE ? 1 : -1,
      s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

  value = Math.abs(value);

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0;
    e = eMax;
  } else {
    e = Math.floor(Math.log(value) / Math.LN2);
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--;
      c *= 2;
    }
    if (e + eBias >= 1) {
      value += rt / c;
    } else {
      value += rt * Math.pow(2, 1 - eBias);
    }
    if (value * c >= 2) {
      e++;
      c /= 2;
    }

    if (e + eBias >= eMax) {
      m = 0;
      e = eMax;
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen);
      e = e + eBias;
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
      e = 0;
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8);

  e = (e << mLen) | m;
  eLen += mLen;
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8);

  buffer[offset + i - d] |= s * 128;
};

}).call(this,require("1YiZ5S"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../node_modules/gulp-browserify/node_modules/browserify/node_modules/buffer/node_modules/ieee754/index.js","/../node_modules/gulp-browserify/node_modules/browserify/node_modules/buffer/node_modules/ieee754")
},{"1YiZ5S":4,"buffer":1}],4:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

}).call(this,require("1YiZ5S"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../node_modules/gulp-browserify/node_modules/browserify/node_modules/process/browser.js","/../node_modules/gulp-browserify/node_modules/browserify/node_modules/process")
},{"1YiZ5S":4,"buffer":1}],5:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var UIplayer;

UIplayer = require('./components/player');

module.exports = function() {
  var container;
  container = document.body.appendChild(document.createElement('div'));
  return React.render(React.createElement(UIplayer, {playingStatus: this.playingStatus, buttons: []}), container);
};


}).call(this,require("1YiZ5S"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/UI/UI.js","/UI")
},{"./components/player":7,"1YiZ5S":4,"buffer":1}],6:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
module.exports = React.createClass({displayName: "exports",
  render: function() {
    var btn, buttons;
    buttons = (function() {
      var i, len, ref, results;
      ref = this.props.enabledButtons;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        btn = ref[i];
        results.push((React.createElement("li", {className: 'b-btn ' + btn.liClass, onClick: btn.callback, key: btn.name}, 
      React.createElement("i", {className: 'b-icon ' + btn.iconClass})
      )));
      }
      return results;
    }).call(this);
    return (
      React.createElement("ol", {className: "b-player--buttons"}, 
        buttons
      )
    );
  }
});


}).call(this,require("1YiZ5S"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/UI/components/buttons.js","/UI/components")
},{"1YiZ5S":4,"buffer":1}],7:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var Buttons, Playlists, Progressbar, VidoScreen, Volume, controls;

controls = require('../../dispatcher/api').controls;

Playlists = require('./playlists');

Volume = require('./volume');

Progressbar = require('./progressbar');

Buttons = require('./buttons');

VidoScreen = require('./videoScreen');

module.exports = React.createClass({
  displayName: 'Player',
  getInitialState: function() {
    return {
      showPlaylists: false,
      videoScreen: false
    };
  },
  prevTrack: function() {
    return controls.push('previousTrack');
  },
  nextTrack: function() {
    return controls.push('nextTrack');
  },
  playAction: function() {
    switch (this.props.playingStatus) {
      case 'isPlaying':
        return controls.push('pause');
      case 'Paused':
        return controls.push('play');
      case 'Stoped':
        return controls.push('play');
    }
  },
  closeVideoScreen: function() {
    return this.setState({
      videoScreen: false
    });
  },
  render: function() {
    var currentTrack, playClass, ref, ref1, showTime, trackInfo, trackTime;
    playClass = this.props.playingStatus === 'isPlaying' ? 'b-icon__pause' : 'b-icon__play';
    currentTrack = (ref = this.props.PLCollection) != null ? (ref1 = ref.getActivePlaylist()) != null ? ref1.getActiveTrack() : void 0 : void 0;
    trackInfo = 'Nothing is playing right now';
    showTime = '';
    if (this.props.position != null) {
      trackInfo = currentTrack.name + " : " + currentTrack.artist;
      trackTime = {
        min: Math.floor(this.props.duration / 60000),
        sec: Math.floor((this.props.duration - Math.floor(this.props.duration / 60000) * 60000) / 1000),
        posMin: Math.floor(this.props.position / 60000),
        posSec: Math.floor((this.props.position - Math.floor(this.props.position / 60000) * 60000) / 1000)
      };
      showTime = trackTime.posMin + ":" + trackTime.posSec + " / " + trackTime.min + ":" + trackTime.sec;
    }
    return (
      React.createElement("div", {className: "b-bandura"}, 
        React.createElement("div", {className: "b-player"}, 
          React.createElement("div", {className: "b-player--section"}, 
            React.createElement("div", {className: "b-controls"}, 
              React.createElement("div", {className: "b-btn b-controls--button", onClick: this.prevTrack}, 
                React.createElement("i", {className: "b-icon b-icon__fast-backward-1"})
              ), 
              React.createElement("div", {className: "b-btn b-controls--button", onClick: this.playAction}, 
                React.createElement("i", {className: 'b-icon ' + playClass})
              ), 
              React.createElement("div", {className: "b-btn b-controls--button", onClick: this.nextTrack}, 
                React.createElement("i", {className: "b-icon b-icon__fast-forward-1"})
              )
            )
          ), 
          React.createElement("div", {className: "b-player--section"}, 
            React.createElement("div", {className: "b-progressbar--wrapper"}, 
              React.createElement("small", {className: "b-progressbar--track--info"}, trackInfo), 
              React.createElement("small", {className: "b-progressbar--track--time"}, showTime), 

              React.createElement(Progressbar, {progress: this.props.position / this.props.duration, loaded: this.props.loaded})
            )
          ), 
          React.createElement("div", {className: "b-player--section"}, 
            React.createElement(Volume, {volume: this.props.volume, mute: this.props.mute})
          ), 
          React.createElement("div", {className: "b-player--section"}, 
            React.createElement(Buttons, {enabledButtons: this.props.buttons})
          )
        ), 
        React.createElement(Playlists, {PLCollection: this.props.PLCollection, isPlaying: this.props.playingStatus, visible: this.state.showPlaylists}), 
        React.createElement(VidoScreen, {videos: this.props.videos, visible: this.state.videoScreen, closeScreen: this.closeVideoScreen})
      )
    );;
  }
});


}).call(this,require("1YiZ5S"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/UI/components/player.js","/UI/components")
},{"../../dispatcher/api":20,"./buttons":6,"./playlists":9,"./progressbar":10,"./videoScreen":13,"./volume":14,"1YiZ5S":4,"buffer":1}],8:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var Track, collections;

Track = require('./track');

collections = require('../../dispatcher/api').collections;

module.exports = React.createClass({
  displayName: 'Playlist',
  drop: function(ev) {
    ev.preventDefault();
    return collections.push({
      action: 'update',
      playlist: this.props.playlist.addTrack(JSON.parse(ev.dataTransfer.getData('track')))
    });
  },
  dragOver: function(ev) {
    return ev.preventDefault();
  },
  render: function() {
    var self, tracks;
    if (this.props.playlist == null) {
      return false;
    }
    self = this;
    tracks = _.map(this.props.playlist.getTracks(), (function(_this) {
      return function(track, index) {
        var isActive, isPlaying;
        isActive = _this.props.isActive && index === _this.props.playlist.getActiveTrackIndex();
        isPlaying = isActive && _this.props.isPlaying;
        return (
        React.createElement("li", {key: index, className: "b-playlist--tracks-item"}, 
          React.createElement(Track, {playlist: self.props.playlist, track: track, index: index, isPlaying: isPlaying, isActive: isActive, key: index})
        )
      );
      };
    })(this));
    return (
        React.createElement("div", {className: "b-playlist", onDrop: this.drop, onDragOver: this.dragOver}, 
          React.createElement("div", {className: "b-playlist--title"}, 
            this.props.playlist.getName()
          ), 
          React.createElement("ul", {className: "b-playlist--tracks"}, 
            tracks
          )
        )
      );
  }
});


}).call(this,require("1YiZ5S"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/UI/components/playlist.js","/UI/components")
},{"../../dispatcher/api":20,"./track":11,"1YiZ5S":4,"buffer":1}],9:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var Playlist;

Playlist = require('./playlist');

module.exports = React.createClass({
  displayName: 'Playlists',
  getInitialState: function() {
    return {
      visiblePlaylist: void 0
    };
  },
  showPlaylist: function(id) {
    return (function(_this) {
      return function() {
        return _this.setState({
          visiblePlaylistId: id
        });
      };
    })(this);
  },
  getVisiblePlaylist: function() {
    if (this.props.PLCollection != null) {
      if (this.state.visiblePlaylistId != null) {
        return this.props.PLCollection.getPlaylistById(this.state.visiblePlaylistId);
      } else {
        return this.props.PLCollection.getActivePlaylist();
      }
    } else {
      return null;
    }
  },
  render: function() {
    var isActive, isPlaying, playlists, ref, ref1, ref2, self, visiblePlaylist;
    self = this;
    playlists = _.map(((ref = this.props.PLCollection) != null ? ref.getAllPlaylists() : void 0) || [], (function(_this) {
      return function(pl) {
        var className, ref1;
        className = 'b-playlists--menu--item ';
        if (((ref1 = _this.props.PLCollection.getActivePlaylist()) != null ? ref1.getId() : void 0) === pl.getId()) {
          className += 'b-playlists--menu--item__active';
        }
        return (
        React.createElement("li", {onClick: self.showPlaylist(pl.getId()), className: className, key: pl.getId()}, pl.getName())
      );
      };
    })(this));
    visiblePlaylist = this.getVisiblePlaylist();
    isActive = ((ref1 = this.props.PLCollection) != null ? (ref2 = ref1.getActivePlaylist()) != null ? ref2.getId() : void 0 : void 0) === (visiblePlaylist != null ? visiblePlaylist.getId() : void 0);
    isPlaying = this.props.isPlaying === 'isPlaying' && isActive;
    if (!this.props.visible) {
      return React.createElement("div", {style: {display:'none'}, className: "b-playlist--title"});
    }
    return (
      React.createElement("div", {className: "b-playlists"}, 
        React.createElement("ul", {className: "b-playlists--menu"}, 
          playlists
        ), 
        React.createElement(Playlist, {playlist: visiblePlaylist, isPlaying: isPlaying, isActive: isActive})
      )
    );;
  }
});


}).call(this,require("1YiZ5S"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/UI/components/playlists.js","/UI/components")
},{"./playlist":8,"1YiZ5S":4,"buffer":1}],10:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var controls, width;

width = 500;

controls = require('../../dispatcher/api').controls;

module.exports = React.createClass({
  displayName: 'Progressbar',
  setPosition: function(ev) {
    return controls.push({
      type: 'setPosition',
      percent: (ev.clientX - ev.currentTarget.getBoundingClientRect().left) / width
    });
  },
  render: function() {
    return (
    React.createElement("div", {className: "b-progressbar", style: {width:width}}, 
      React.createElement("div", {className: "b-progressbar--container", onClick: this.setPosition}, 
      React.createElement("div", {className: "b-progressbar--loaded", style: {width: this.props.loaded ? this.props.loaded * width : 0}}), 
         React.createElement("div", {className: "b-draggable b-progressbar--drag", style: {top: -6, left: this.props.progress ? this.props.progress * width : 0}})
      )
    )
    );;
  }
});


}).call(this,require("1YiZ5S"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/UI/components/progressbar.js","/UI/components")
},{"../../dispatcher/api":20,"1YiZ5S":4,"buffer":1}],11:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var collections, controls, ref;

ref = require('../../dispatcher/api'), controls = ref.controls, collections = ref.collections;

module.exports = React.createClass({
  displayName: 'Track',
  play: function() {
    controls.push('stop');
    collections.push({
      action: 'updateActive',
      playlist: this.props.playlist.changeTrack(this.props.index)
    });
    return controls.push('play');
  },
  pause: function() {
    return controls.push('pause');
  },
  resume: function() {
    return controls.push('play');
  },
  render: function() {
    var action, className;
    className = 'b-track';
    if (this.props.isPlaying) {
      className += ' b-track__playing';
    }
    action = this.props.isActive ? this.props.isPlaying ? this.pause : this.resume : this.play;
    return (
      React.createElement("div", {className: className, onClick: action}, 
        React.createElement("div", {className: "b-track__artist"}, this.props.track.artist), 
        React.createElement("div", {className: "b-track__name"}, this.props.track.name)
      )
    );;
  }
});


}).call(this,require("1YiZ5S"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/UI/components/track.js","/UI/components")
},{"../../dispatcher/api":20,"1YiZ5S":4,"buffer":1}],12:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
module.exports = React.createClass({
  displayName: 'videoItem',
  handleClick: function() {
    return this.props.onClick(this.props.video);
  },
  render: function() {
    if (this.props.showVideo) {
      return (
      React.createElement("div", {className: "b-video--item video_active"}, 
          React.createElement("div", {className: "b-video--popup"}, 
            React.createElement("div", {className: "b-video--popup--height"}
            ), 
            React.createElement("div", {className: "b-video--popup--wrapper"}, React.createElement("iframe", {width: "560", height: "315", src: "https://www.youtube.com/embed/"+this.props.video.id, frameBorder: "0", allowFullScreen: true}))
          ), 
          React.createElement("div", {className: "b-video--picture"}, 
            React.createElement("img", {className: "b-video--picture--img", src: this.props.video.thumbnail.hqDefault})
          )

      )
      );
    } else {
      return (
      React.createElement("div", {className: "b-video--item", onClick: this.handleClick}, 
        React.createElement("div", {className: "b-video--picture"}, 
          React.createElement("img", {className: "b-video--picture--img", src: this.props.video.thumbnail.hqDefault})
        )
      )
      );
    }
  }
});


}).call(this,require("1YiZ5S"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/UI/components/videoItem.js","/UI/components")
},{"1YiZ5S":4,"buffer":1}],13:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var VideoItem;

VideoItem = require('./videoItem');

module.exports = React.createClass({
  displayName: 'videoScreen',
  getInitialState: function() {
    return {
      visibleVideo: false
    };
  },
  clickVideo: function(video) {
    return this.setState({
      visibleVideo: video
    });
  },
  render: function() {
    var self, videoItems;
    if (!((this.props.videos != null) && this.props.visible)) {
      return (React.createElement("div", null));
    }
    self = this;
    videoItems = this.props.videos.map(function(video) {
      return (React.createElement(VideoItem, {video: video, key: video.id, onClick: self.clickVideo, showVideo: video==self.state.visibleVideo}));
    });
    return (
    React.createElement("div", {className: "b-video"}, 
        React.createElement("a", {href: "#", className: "b-video--close", onClick: this.props.closeScreen}, "X"), 
        videoItems
    )

    );
  }
});


}).call(this,require("1YiZ5S"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/UI/components/videoScreen.js","/UI/components")
},{"./videoItem":12,"1YiZ5S":4,"buffer":1}],14:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var Bandura, changeVolume, settingsChanges;

Bandura = require('../../api/Bandura');

settingsChanges = require('../../dispatcher/api').settingsChanges;

changeVolume = function(ev, refs) {
  var volume;
  volume = (ev.clientX - refs.container.getDOMNode().getBoundingClientRect().left) * 2;
  return settingsChanges.push({
    volume: volume
  });
};

module.exports = React.createClass({displayName: "exports",
  getInitialState: function() {
    return {
      drag: false
    };
  },
  handleDrag: function(e, ui) {
    return settingsChanges.push({
      volume: ui.position.left * 2
    });
  },
  mute: function() {
    return settingsChanges.push({
      mute: !this.props.mute
    });
  },
  mouseDown: function(ev) {
    this.setState({
      drag: true
    });
    return changeVolume(ev, this.refs);
  },
  mouseMove: function(ev) {
    if (!this.state.drag) {
      return;
    }
    return changeVolume(ev, this.refs);
  },
  cancelDrag: function() {
    return this.setState({
      drag: false
    });
  },
  render: function() {
    var muteIcon;
    muteIcon = this.props.mute ? 'b-icon__volume-off-1' : 'b-icon__volume';
    return (
    React.createElement("div", {
      className: "b-volume", 
      onMouseDown: this.mouseDown, 
      onMouseMove: this.mouseMove, 
      onMouseUp: this.cancelDrag, 
      onMouseLeave: this.cancelDrag
    }, 
    React.createElement("i", {className: 'b-icon b-icon__mute ' + muteIcon, onClick: this.mute}), 
    React.createElement("div", {className: "b-volume--container", ref: "container"}, 
      React.createElement("div", {className: "b-volume--draggable"}, 
        React.createElement("i", {className: "b-icon b-icon__record b-draggable", style: {top:-26, left: this.props.volume / 2 - 5}})
      )
    )
    )
    );;
  }
});


}).call(this,require("1YiZ5S"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/UI/components/volume.js","/UI/components")
},{"../../api/Bandura":15,"../../dispatcher/api":20,"1YiZ5S":4,"buffer":1}],15:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var Bandura, PLCollection, PlayerSettings, Playlist, Track, activePlaylist, buttons, collections, controls, progress, ref, render, settingsChanges, soundEvents, videos;

ref = require('../dispatcher/api'), controls = ref.controls, progress = ref.progress, activePlaylist = ref.activePlaylist, collections = ref.collections, settingsChanges = ref.settingsChanges, videos = ref.videos, buttons = ref.buttons, soundEvents = ref.soundEvents;

PlayerSettings = require('./PlayerSettings');

Track = require('./Track');

Playlist = require('./Playlist');

PLCollection = require('./PLCollection');

Bandura = (function() {
  var soundManagerEvents;

  soundManagerEvents = ['load', 'play', 'pause', 'resume', 'stop', 'failure', 'finish'];

  function Bandura(options) {
    var defaultButtons, ref1;
    this.volume = options.volume || 40;
    this._remoteSettings = options.remote;
    settingsChanges.push(new PlayerSettings(this.volume, false));
    soundManager.setup({
      url: "http://localhost/required/swf/",
      debugFlash: false,
      debugMode: false,
      consoleOnly: true,
      flashLoadTimeout: 5000,
      flashVersion: 9,
      useHighPerformance: true,
      preferFlash: false,
      useHTML5Audio: true,
      useFlashBlock: true,
      html5PollingInterval: 1000,
      flashPollingInterval: 1000,
      defaultOptions: {
        volume: this.volume,
        whileplaying: function() {
          return progress.push(this);
        },
        whileloading: function() {
          return progress.push(this);
        }
      }
    });
    soundManagerEvents.forEach(function(ev) {
      var obj1;
      return soundManager.setup({
        defaultOptions: (
          obj1 = {},
          obj1["on" + ev] = function() {
            return soundEvents.push(ev);
          },
          obj1
        )
      });
    });
    ref1 = render(), this.UI = ref1.UI, this.events = ref1.events;
    defaultButtons = [
      {
        name: 'Remote',
        order: 3,
        action: (function() {
          return this.startRemote();
        }).bind(this),
        liClass: 'b-player--network',
        iconClass: 'b-icon__network',
        tooltip: 'Start remote control'
      }, {
        name: 'Youtube',
        order: 2,
        action: this.findYouTubeVideos.bind(this),
        liClass: 'b-player--youtube',
        iconClass: 'b-icon__youtube',
        tooltip: 'Search video on youtube'
      }, {
        order: 1,
        name: 'Toggle playlists',
        action: (function() {
          return this.UI.setState({
            showPlaylists: !this.UI.state.showPlaylists
          });
        }).bind(this),
        liClass: 'b-player--show-pl',
        iconClass: 'b-icon__th-list',
        tooltip: 'open/close playlists'
      }
    ];
    buttons.push(defaultButtons);
    if (options.buttons != null) {
      buttons.push(options.buttons);
    }
  }

  Bandura.prototype.setVolume = function(vol) {
    this.volume = Bandura.valideVolume(vol);
    settingsChanges.push({
      volume: this.volume
    });
    return this;
  };

  Bandura.prototype.mute = function() {
    return settingsChanges.push({
      mute: true
    });
  };

  Bandura.prototype.unmute = function() {
    return settingsChanges.push({
      mute: false
    });
  };

  Bandura.prototype.playTrack = function(obj) {
    var track;
    track = (function() {
      if (obj instanceof Track || (obj == null)) {
        return obj;
      } else if (_.isEmpty(obj)) {
        throw new error('track cant be empty object');
      } else {
        return new Track(obj);
      }
    })();
    controls.push('stop');
    this.setCustomPlaylist([track]);
    controls.push('play');
    return this;
  };

  Bandura.prototype.pause = function() {
    controls.push('pause');
    return this;
  };

  Bandura.prototype.stop = function() {
    controls.push('stop');
    return this;
  };

  Bandura.prototype.play = function() {
    controls.push('play');
    return this;
  };

  Bandura.prototype.setPosition = function(percent) {
    controls.push({
      type: 'setPosition',
      percent: percent
    });
    return this;
  };

  Bandura.prototype.playPlaylist = function(pl) {
    controls.push('stop');
    collections.push({
      action: 'updateActive',
      playlist: pl
    });
    controls.push('play');
    return this;
  };

  Bandura.prototype.nextTrack = function() {
    controls.push('nextTrack');
    return this;
  };

  Bandura.prototype.previousTrack = function() {
    controls.push('previousTrack');
    return this;
  };

  Bandura.prototype.setCustomPlaylist = function(tracks, currentTrack) {
    if (currentTrack == null) {
      currentTrack = 0;
    }
    return collections.push({
      action: 'updateActive',
      playlist: new Playlist(tracks, 'Custom playlist', currentTrack, PLCollection.CUSTOM_ID)
    });
  };

  Bandura.prototype.setActivePlaylist = function(pl) {
    controls.push('stop');
    collections.push({
      action: 'updateActive',
      playlist: pl
    });
    return this;
  };

  Bandura.prototype.setPlaylistsCollection = function(collection) {
    if (!(collection instanceof PLCollection)) {
      collection = new PLCollection(collection);
    }
    collections.push({
      action: 'setNewCollection',
      collection: collection
    });
    return this;
  };

  Bandura.prototype.removePlaylist = function(pl) {
    collections.push({
      action: 'removePlaylist',
      playlist: pl
    });
    return this;
  };

  Bandura.prototype.addPlaylist = function(pl) {
    collections.push({
      action: 'addPlaylist',
      playlist: pl
    });
    return this;
  };

  Bandura.prototype.startRemote = function(settings) {
    var remoteActions, ws;
    settings || (settings = this._remoteSettings);
    ws = new WebSocket(settings.host);
    remoteActions = Bacon.fromEventTarget(ws, 'message', function(ev) {
      var ref1;
      return ((ref1 = settings.actions) != null ? ref1[ev.data] : void 0) || ev.data;
    });
    return controls.plug(remoteActions);
  };

  Bandura.prototype.findYouTubeVideos = function(track) {
    var protocol, query, url;
    this.UI.setState({
      videoScreen: true
    });
    if (!track) {
      throw new Error('Noting is playing right now');
    }
    query = track.artist || '' + ' ' + track.name || '';
    protocol = window.location.protocol || 'http:';
    url = protocol + ("//gdata.youtube.com/feeds/api/videos/-/Music?q=" + query + "&hd=true&v=2&alt=jsonc&safeSearch=strict");
    return videos.plug(Bacon.fromPromise($.ajax({
      url: url,
      dataType: "jsonp"
    })).map(function(response) {
      return response.data.items;
    }));
  };

  Bandura.prototype.addButtons = function(additionalButtons) {
    return buttons.push(additionalButtons);
  };

  Bandura.valideVolume = function(vol) {
    if (!_.isNumber(vol)) {
      throw new Error('must be a number');
    }
    if (vol < 0) {
      return 0;
    } else if (vol > 100) {
      return 100;
    } else {
      return vol;
    }
  };

  return Bandura;

})();

module.exports = Bandura;

render = require('../dispatcher/render');


}).call(this,require("1YiZ5S"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/api/Bandura.js","/api")
},{"../dispatcher/api":20,"../dispatcher/render":22,"./PLCollection":16,"./PlayerSettings":17,"./Playlist":18,"./Track":19,"1YiZ5S":4,"buffer":1}],16:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var PLCollection, Playlist, Utils;

Utils = require('../utils/utils');

Playlist = require('./Playlist');

PLCollection = (function() {
  PLCollection.CUSTOM_ID = 0;

  PLCollection.FAVORITE_ID = 1;

  function PLCollection(playlists, sorted, ids, activeId) {
    if (sorted == null) {
      sorted = false;
    }
    if (ids == null) {
      ids = null;
    }
    if (activeId == null) {
      activeId = null;
    }
    if (playlists != null) {
      this._playlists = sorted ? playlists : _.sortBy(playlists, function(pl) {
        return pl.getId();
      });
    } else {
      this._playlists = [new Playlist([], 'Custom playlist', 0, PLCollection.CUSTOM_ID), new Playlist([], 'Favourite', 0, PLCollection.FAVORITE_ID)];
    }
    this._activeId = activeId;
    this._plIds = ids || _.map(this._playlists, function(pl) {
      return pl.getId();
    });
  }

  PLCollection.prototype.addPlaylist = function(playlist) {
    var id, position;
    id = playlist.getId();
    if (_.contains(this._plIds, id)) {
      throw new Error('Collection allready contains this playlist');
    }
    position = _.sortedIndex(this._plIds, id);
    return new PLCollection(Utils.insertOn(this._playlists, playlist, position), true, Utils.insertOn(this._plIds, id, position), this._activeId);
  };

  PLCollection.prototype.removePlaylist = function(playlist) {
    var position;
    position = _.sortedIndex(this._plIds, playlist.getId());
    return new PLCollection(Utils.removeFrom(this._playlists, position), true, Utils.removeFrom(this._plIds, position), this._activeId);
  };

  PLCollection.prototype.update = function(playlist) {
    var index, list;
    index = _.indexOf(this._plIds, playlist.getId(), true);
    if (index < 0) {
      return this.addPlaylist(playlist);
    }
    list = this._playlists;
    list[index] = playlist;
    return new PLCollection(list, true, this._plIds, this._activeId);
  };

  PLCollection.prototype.updateActive = function(playlist) {
    var plc;
    plc = this.update(playlist);
    if ((this._activeId != null) === playlist.getId()) {
      return plc;
    } else {
      return plc.setActivePlaylist(playlist);
    }
  };

  PLCollection.prototype.setActivePlaylist = function(playlist) {
    return new PLCollection(this._playlists, true, this._plIds, playlist.getId());
  };

  PLCollection.prototype.getPlaylistById = function(id) {
    var index;
    index = _.indexOf(this._plIds, id, true);
    if (index < 0) {
      throw new Error("there are no playlist with id=" + id);
    }
    return this._playlists[index];
  };

  PLCollection.prototype.getAllPlaylists = function() {
    return this._playlists;
  };

  PLCollection.prototype.getActivePlaylist = function() {
    var err;
    try {
      return this.getPlaylistById(this._activeId);
    } catch (_error) {
      err = _error;
      return null;
    }
  };

  PLCollection.prototype.getCustomPlaylist = function() {
    return this._playlists[this.CUSTOM_ID];
  };

  PLCollection.prototype.getFavoritePlaylist = function() {
    return this._playlists[this.FAVORITE_ID];
  };

  return PLCollection;

})();

module.exports = PLCollection;


}).call(this,require("1YiZ5S"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/api/PLCollection.js","/api")
},{"../utils/utils":24,"./Playlist":18,"1YiZ5S":4,"buffer":1}],17:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var PlayerSettings;

PlayerSettings = (function() {
  function PlayerSettings(volume, mute1) {
    this.volume = volume;
    this.mute = mute1;
  }

  PlayerSettings.prototype.setVolume = function(vol) {
    return new PlayerSettings(vol, this.mute);
  };

  PlayerSettings.prototype.setMute = function(mute) {
    return new PlayerSettings(this.volume, mute);
  };

  return PlayerSettings;

})();

module.exports = PlayerSettings;


}).call(this,require("1YiZ5S"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/api/PlayerSettings.js","/api")
},{"1YiZ5S":4,"buffer":1}],18:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var Playlist, Utils;

Utils = require('../utils/utils');

Playlist = (function() {
  function Playlist(_tracks, _name, _activeTrackIndex, _id) {
    this._tracks = _tracks != null ? _tracks : [];
    this._name = _name != null ? _name : 'User playlist';
    this._activeTrackIndex = _activeTrackIndex != null ? _activeTrackIndex : 0;
    this._id = _id != null ? _id : Utils.randomId();
  }

  Playlist.prototype.getName = function() {
    return this._name;
  };

  Playlist.prototype.getTracks = function() {
    return this._tracks;
  };

  Playlist.prototype.getId = function() {
    return this._id;
  };

  Playlist.prototype.getActiveTrack = function() {
    return this._tracks[this._activeTrackIndex];
  };

  Playlist.prototype.getActiveTrackIndex = function() {
    return this._activeTrackIndex;
  };

  Playlist.prototype.changeTrack = function(trackIndex) {
    if (trackIndex === this._activeTrackIndex) {
      return this;
    }
    return new Playlist(this._tracks, this._name, trackIndex, this._id);
  };

  Playlist.prototype.nextTrack = function() {
    if (this._activeTrackIndex >= this._tracks.length - 1) {
      throw new Error('no next track');
    }
    return this.changeTrack(this._activeTrackIndex + 1);
  };

  Playlist.prototype.previousTrack = function() {
    if (this._activeTrackIndex <= 0) {
      throw new Error('no previous track');
    }
    return this.changeTrack(this._activeTrackIndex - 1);
  };

  Playlist.prototype.addTracks = function(tracks, position) {
    var activeTrack, newTracks;
    if (position) {
      newTracks = Utils.insertOn(this._tracks, tracks, position);
      activeTrack = position > this._activeTrackIndex ? this._activeTrackIndex : this._activeTrackIndex + tracks.length;
    } else {
      newTracks = this._tracks.concat(tracks);
      activeTrack = this._activeTrackIndex;
    }
    return new Playlist(newTracks, this._name, activeTrack, this._id);
  };

  Playlist.prototype.addTrack = function(track, position) {
    return this.addTracks([track], position);
  };

  Playlist.prototype.removeTrack = function(opt) {
    var activeTrack, delta, tracks;
    if (opt instanceof Track) {
      tracks = _.without(this._tracks, opt);
      delta = _.sortedIndex(Utils.allIndexOf(this._tracks, opt), this._activeTrackIndex);
      activeTrack = this._activeTrackIndex - delta;
    } else {
      tracks = Utils.removeFrom(this._tracks, opt);
      activeTrack = opt <= this._activeTrackIndex ? this._activeTrackIndex : this._activeTrackIndex - 1;
    }
    return new Playlist(tracks, this._name, activeTrack, this._id);
  };

  return Playlist;

})();

module.exports = Playlist;


}).call(this,require("1YiZ5S"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/api/Playlist.js","/api")
},{"../utils/utils":24,"1YiZ5S":4,"buffer":1}],19:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var Track;

Track = (function() {
  Track.prototype.defaults = {
    artist: 'unknown artist',
    name: 'unknown track'
  };

  function Track(data) {
    _.extend(this, this.defaults, data);
  }

  return Track;

})();

module.exports = Track;


}).call(this,require("1YiZ5S"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/api/Track.js","/api")
},{"1YiZ5S":4,"buffer":1}],20:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var dispatcherAPI;

dispatcherAPI = {
  controls: new Bacon.Bus(),
  progress: new Bacon.Bus(),
  collections: new Bacon.Bus(),
  settingsChanges: new Bacon.Bus(),
  videos: new Bacon.Bus(),
  buttons: new Bacon.Bus(),
  soundEvents: new Bacon.Bus()
};

module.exports = dispatcherAPI;


}).call(this,require("1YiZ5S"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/dispatcher/api.js","/dispatcher")
},{"1YiZ5S":4,"buffer":1}],21:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var Bandura, PLCollection, Utils, buttons, callbacks, collections, controls, playerActions, playerSettings, playlistsCollection, progress, progressbar, ref, settingsChanges, soundEvents, videos;

ref = require('./api'), controls = ref.controls, progress = ref.progress, collections = ref.collections, settingsChanges = ref.settingsChanges, videos = ref.videos, buttons = ref.buttons, soundEvents = ref.soundEvents;

PLCollection = require('../api/PLCollection');

Bandura = require('../api/Bandura');

Utils = require('../utils/utils');

progressbar = progress.map(function(smTrack) {
  return {
    position: smTrack.position,
    duration: smTrack.duration,
    loaded: smTrack.bytesLoaded / smTrack.bytesTotal
  };
});

playerSettings = settingsChanges.scan({}, function(settings, changes) {
  if ((changes.mute != null) && changes.mute) {
    soundManager.mute();
  } else {
    soundManager.unmute();
  }
  if (changes.volume != null) {
    changes.volume = Bandura.valideVolume(changes.volume);
    changes.mute = false;
    soundManager.setup({
      defaultOptions: {
        volume: changes.volume
      }
    });
  }
  return Utils.extendImmutable(settings, changes);
});

playlistsCollection = collections.scan(new PLCollection(), function(collection, ev) {
  if (ev.action === 'setNewCollection') {
    return ev.collection;
  }
  return collection[ev.action](ev.playlist);
});

playerSettings.changes().combine(playlistsCollection, function(a, b) {
  return {
    settings: a,
    collection: b
  };
}).onValue(function(obj) {
  var collection, ref1, ref2, settings;
  settings = obj.settings, collection = obj.collection;
  return soundManager.setVolume((ref1 = collection.getActivePlaylist()) != null ? (ref2 = ref1.getActiveTrack()) != null ? ref2.id : void 0 : void 0, settings.volume);
});

playerActions = playlistsCollection.combine(controls, function(a, b) {
  return {
    collection: a,
    action: b
  };
}).map(function(obj) {
  var nextTrack, playlist, position, previousTrack, ref1, track;
  playlist = obj.collection.getActivePlaylist();
  if (typeof obj.action === 'string') {
    switch (obj.action) {
      case 'stop':
        soundManager.destroySound(playlist != null ? (ref1 = playlist.getActiveTrack()) != null ? ref1.id : void 0 : void 0);
        return Utils.extendImmutable(playlist, {
          playingStatus: 'Stoped'
        });
      case 'play':
        console.log('----', obj.collection);
        soundManager.pauseAll();
        if (playlist.getActiveTrack()) {
          soundManager.createSound(playlist.getActiveTrack());
          soundManager.play(playlist.getActiveTrack().id);
        }
        return Utils.extendImmutable(playlist, {
          playingStatus: 'isPlaying'
        });
      case 'pause':
        soundManager.pauseAll();
        return Utils.extendImmutable(playlist, {
          playingStatus: 'Paused'
        });
      case 'nextTrack':
        nextTrack = playlist.nextTrack();
        controls.push('stop');
        collections.push({
          action: 'update',
          playlist: nextTrack
        });
        controls.push('play');
        return Utils.extendImmutable(nextTrack, {
          result: 'switched to next track'
        });
      case 'previousTrack':
        previousTrack = playlist.previousTrack();
        controls.push('stop');
        collections.push({
          action: 'update',
          playlist: previousTrack
        });
        controls.push('play');
        return Utils.extendImmutable(previousTrack, {
          result: 'switched to previous track'
        });
    }
  } else {
    switch (obj.action.type) {
      case 'setPosition':
        track = soundManager.getSoundById(playlist.getActiveTrack().id);
        position = track.duration * obj.action.percent;
        return track.setPosition(position);
    }
  }
});

soundEvents.onValue(function(ev) {
  switch (ev) {
    case 'finish':
      return controls.push('nextTrack');
  }
});

callbacks = buttons.scan([], function(buttons, ev) {
  return buttons.concat(ev);
}).combine(playlistsCollection, function(buttons, collection) {
  return buttons.map(function(btn) {
    return _.extend(btn, {
      callback: function() {
        var ref1;
        return btn.action((ref1 = collection.getActivePlaylist()) != null ? ref1.getActiveTrack() : void 0, collection);
      }
    });
  }).sort(function(a, b) {
    return a.order > b.order;
  });
});

module.exports = {
  progressbar: progressbar,
  playerSettings: playerSettings,
  playlistsCollection: playlistsCollection,
  playerActions: playerActions,
  videos: videos,
  callbacks: callbacks,
  soundEvents: soundEvents
};


}).call(this,require("1YiZ5S"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/dispatcher/main.js","/dispatcher")
},{"../api/Bandura":15,"../api/PLCollection":16,"../utils/utils":24,"./api":20,"1YiZ5S":4,"buffer":1}],22:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var callbacks, playerActions, playerSettings, playlistsCollection, progressbar, ref, renderUI, soundEvents, videos;

renderUI = require('../UI/UI');

ref = require('./main'), progressbar = ref.progressbar, playerSettings = ref.playerSettings, playlistsCollection = ref.playlistsCollection, playerActions = ref.playerActions, videos = ref.videos, callbacks = ref.callbacks, soundEvents = ref.soundEvents;

module.exports = function() {
  var UI, banduraEvents;
  UI = renderUI();
  progressbar.onValue(function(progressbar) {
    return UI.setProps({
      position: progressbar.position,
      duration: progressbar.duration,
      loaded: progressbar.loaded
    });
  });
  playerSettings.onValue(function(settings) {
    return UI.setProps(settings);
  });
  playlistsCollection.onValue(function(PLC) {
    console.log('----', 'change in PLC');
    return UI.setProps({
      PLCollection: PLC
    });
  });
  playerActions.onValue(function(obj) {
    if (obj.playingStatus != null) {
      return UI.setProps({
        playingStatus: obj.playingStatus
      });
    }
  });
  videos.onValue(function(videos) {
    console.log('----', videos);
    return UI.setProps({
      videos: videos
    });
  });
  callbacks.onValue(function(buttons) {
    return UI.setProps({
      buttons: buttons
    });
  });
  banduraEvents = soundEvents.combine(playlistsCollection, function(se, plc) {
    return {
      collection: plc,
      event: se
    };
  });
  return {
    UI: UI,
    events: banduraEvents
  };
};


}).call(this,require("1YiZ5S"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/dispatcher/render.js","/dispatcher")
},{"../UI/UI":5,"./main":21,"1YiZ5S":4,"buffer":1}],23:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
window.Bandura = require('./api/Bandura');


/*
window.bandura = new Bandura
  remote:
    host: 'ws://localhost:3000'
    actions:
      Previous: 'previousTrack'
      Next: 'nextTrack'
      Play: 'play'
      Pause: 'pause'
  buttons: [
    name: 'Custom'
    order: 4
    action: (track)-> alert(track?.name)
    liClass: 'b-player--network'
    iconClass: 'b-icon__network'
    tooltip: 'Some custom button'
  ]

#====fixtures===
window.playlists = require './fixtures/playlists'
window.tracks = require './fixtures/tracks'
require './fixtures/mainpage'
 */


}).call(this,require("1YiZ5S"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/fake_67221a70.js","/")
},{"./api/Bandura":15,"1YiZ5S":4,"buffer":1}],24:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var slice = [].slice;

window.Utils = {
  extendImmutable: function() {
    var arg;
    arg = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    return _.extend.apply(this, [{}].concat(arg));
  },
  randomId: function() {
    return Math.floor(Math.random() * 900 + 100);
  },
  insertOn: function(array, elements, position) {
    return array.slice(0, position).concat(elements, array.slice(position));
  },
  removeFrom: function(array, position) {
    return array.slice(0, position).concat(array.slice(position));
  },
  allIndexOf: function(array, element) {
    return _.reduce(array, function(acc, el, index) {
      if (el === element) {
        return acc.concat(index);
      } else {
        return acc;
      }
    }, []);
  }
};

module.exports = Utils;


}).call(this,require("1YiZ5S"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/utils/utils.js","/utils")
},{"1YiZ5S":4,"buffer":1}]},{},[23])


//# sourceMappingURL=roma.js.map