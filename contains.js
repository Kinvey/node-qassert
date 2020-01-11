/**
 * Copyright (C) 2016 Andras Radics
 * Licensed under the Apache License, Version 2.0
 */

'use strict';

var assert = require('assert');

var nodeMajor = parseInt(process.version.slice(1));

// extracted from qibl:
var newBuf = eval('nodeMajor < 10 ? Buffer : function(a, b, c) { return typeof(a) === "number" ? Buffer.allocUnsafe(a) : Buffer.from(a, b, c) }');
var allocBuf = eval('nodeMajor >= 6 ? Buffer.allocUnsafe : Buffer');
var fromBuf = eval('nodeMajor >= 6 ? Buffer.from : Buffer');

module.exports = {
    contains: contains,
    strictContains: function(a,b) { return contains(a, b, true) },
    notContains: function(a,b) { return ! contains(a, b) },
    notStrictContains: function(a,b) { return ! contains(a, b, true) },
}

function contains( a, b, asStrict ) {
    if (typeof a === 'string') {
        // string a matches pattern b
        if (b instanceof RegExp) return b.test(a);
        // string a contains substring b
        if (asStrict && typeof b !== 'string') return false;
        return a.indexOf('' + b) >= 0;
    }

    if (Buffer.isBuffer(a)) {
        // contents of Buffer a converted to string match pattern b
        if (b instanceof RegExp) return b.test('' + a);
        // Buffer contains substring or sub-buffer
        if (asStrict && typeof b !== 'string' && !Buffer.isBuffer(b)) return false;
// FIXME: multi-byte utf8 characters could produce false positives
        if (!Buffer.isBuffer(b)) b = fromBuf('' + b);
        return a.toString('hex').indexOf(b.toString('hex')) >= 0;
    }

    if (Array.isArray(a)) {
        if (Array.isArray(b)) {
            // array must contain all elements from b
            for (var i=0; i<b.length; i++) if (!_arrayContains(a, b[i], asStrict)) return false;
            return true;
        }
        else if (typeof b === 'object' && isHash(b)) {
            // one of the array element must contain b
            for (var i=0; i<a.length; i++) if (_objectContains(a[i], b, asStrict)) return true;
            return false;
        }
        else {
            // array must contain element
            return _arrayContains(a, b, asStrict);
        }
    }

    if (isContainerObject(a)) {
        return _objectContains(a, b, asStrict);
    }

    // simple values only strict contain themselves
    // or can contain their type-coerced equivalents too
    return asStrict ? (a === b) : (a == b);
}

// test whether any array element contains the item
function _arrayContains( arr, item, asStrict ) {
    if (isContainerObject(item)) {
        for (var i=0; i<arr.length; i++) {
            if (isContainerObject(arr[i]) && _objectContains(arr[i], item, asStrict)) return true;
        }
        return false;
    }
    else {
        // ?? if (asStrict) return arr.indexOf(item);
        // TODO: double-check semantics
        for (var i=0; i<arr.length; i++) if (deepEqual(arr[i], item, asStrict)) return true;
        return false;
    }
}

// test whether the object obj contains the item as a subset
function _objectContains( obj, item, asStrict ) {
    if (isContainerObject(item)) {
        // all fields from item must be present
        if (!(typeof obj === 'object')) return false;
        for (var k in item) if (!(k in obj) || !deepEqual(item[k], obj[k], asStrict)) return false;
        return true;
    }
    else {
        // any field may equal item
        for (var k in obj) if (deepEqual(obj[k], item, asStrict)) return true;
        return false;
    }
}

function deepEqual( a, b, asStrict ) {
    var compar = asStrict && assert.deepStrictEqual ? assert.deepStrictEqual : assert.deepEqual;
    try { compar(a, b); return true }
    catch (err) { return false }
}

// TODO: is a user-defined type eg Coordinate a container or a data item?
// TODO: isContainer really means isHash, and should be implemented as such
var dataObjectTypes = ['Array', 'Buffer', 'Date', 'RegExp'];
function isContainerObject( a ) {
    return (a && typeof a === 'object' && dataObjectTypes.indexOf(a.constructor.name) < 0);
}
function isHash( item ) {
    return item && typeof item === 'object' && item.constructor === Object;
}
