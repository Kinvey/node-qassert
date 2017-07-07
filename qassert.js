/**
 * Copyright (C) 2015-2017 Andras Radics
 * Licensed under the Apache License, Version 2.0
 *
 * Qnit assertions.
 */

'use strict';

var assert = require('assert');
var __contains = require('./contains');

var qassert = {
    AssertionError: assert.AssertionError,

    // delegated assert methods
    ok: _assert,
    fail: _fail,        // fail is our own, overrides assert.fail
    equal: _equal,
    notEqual: _notEqual,
    deepEqual: _deepEqual,
    notDeepEqual: _notDeepEqual,
    deepStrictEqual: _deepStrictEqual,
    notDeepStrictEqual: _notDeepStrictEqual,
    strictEqual: _strictEqual,
    notStrictEqual: _notStrictEqual,
    throws: _throws,
    doesNotThrow: _doesNotThrow,
    ifError: _ifError,

    // new test methods
    contains: _contains,
    strictContains: _strictContains,
    within: _within,
    inorder: _inorder,

    // aliases
    equals: _equal,
    assert: _assert,
    contain: _contains,

    assertionCount: 0,
    _wrapAssertion: _wrapAssertion,
}

module.exports = function( value ) {
    return qassert.assert(value);
}
for (var k in qassert) module.exports[k] = qassert[k];
// make exports into struct, to speed access
_assert.prototype = module.exports;

function _fail(m) { fail("test", "failed", "test does not pass" + (m ? ": " + m : ""), "", _fail); };


function _assert(p, m) {
    // assertionCount must be a `this` property so we can re-attach the test methods to eg test runners
    this.assertionCount += 1;
    if (!p) fail(p, "truthy", m, "is", _assert); }

// patch the assertion error to include the user message alongside the built-in inspected values
// assert() shows the user message instead of the inspected values, which is less than helpful
function _wrapAssertion( assertion, startStackFunction, message, actual, expected, operator ) {
    this.assertionCount += 1;
    try {
        return assertion(actual, expected);
    }
    catch (err) {
        fail(actual, expected, message, operator, startStackFunction);
    }
}

function _equal(a,b,m) {
    return this._wrapAssertion(assert.equal, _equal, m, a, b, '==') }
function _notEqual(a,b,m) {
    return this._wrapAssertion(assert.notEqual, _notEqual, m, a, b, '!=') }
function _deepEqual(a,b,m) {
    return this._wrapAssertion(assert.deepEqual, _deepEqual, m, a, b, 'deepEqual') }
function _notDeepEqual(a,b,m) {
    return this._wrapAssertion(assert.notDeepEqual, _notDeepEqual, m, a, b, 'notDeepEqual') }
function _deepStrictEqual(a,b,m) {
    return this._wrapAssertion(assert.deepStrictEqual || assert.deepEqual, _deepStrictEqual, m, a, b, 'deepStrictEqual') }
function _notDeepStrictEqual(a,b,m) {
    return this._wrapAssertion(assert.notDeepStrictEqual || assert.notDeepEqual, _notDeepStrictEqual, m, a, b, 'notDeepStrictEqual') }
function _strictEqual(a,b,m) {
    return this._wrapAssertion(assert.strictEqual, _strictEqual, m, a, b, '===') }
function _notStrictEqual(a,b,m) {
    return this._wrapAssertion(assert.notStrictEqual, _notStrictEqual, m, a, b, '!==') }
function _throws(a,b,m) {
// TODO: is this arg steering necessary, or does assert() do it already?
//    switch (arguments.length) {
//    case 1: b = m = undefined; break;
//    case 2: if (typeof b !== 'object') { m = b; b = undefined; }; break;
//    }
    return this._wrapAssertion(assert.throws, _throws, m, a, b, 'throws') }
function _doesNotThrow(a,m) {
    return this._wrapAssertion(assert.doesNotThrow, _doesNotThrow, m, a, undefined, 'doesNotThrow') }
function _ifError(a,m) {
    return this._wrapAssertion(assert.ifError, _ifError, m, a, 'truthy', 'Error is') }

// add-ons
function _contains(a,b,m) {
    if (contains(a, b)) return true;
    fail(a, b, m, 'contains', _contains); };
function _strictContains(a,b,m) {
    if (contains(a, b, true)) return true;
    fail(a, b, m, 'contains', _contains); };
function _within(a,b,dist,m) {
    if (within(a, b, dist)) return true;
    fail(a, b, m, 'within ' + dist + ' of', _within);
}
function _inorder(a, compar, m) {
    if (m == undefined && typeof compar !== 'function') {
        m = compar;
        compar = null;
    }
    var ok = inorder(a, compar, m)
    if (ok === true) return true;
    fail(a[ok], a[ok+1], m, 'inorder', _inorder);
}

// wrapper assert.fail for more useful diagnostics
function fail( actual, expected, message, operator, stackStartFunction ) {
    try {
        assert.fail(actual, expected, null, operator, stackStartFunction);
    }
    catch (err) {
        annotateError(err, message);
        throw err;
    }
}

function annotateError( err, message ) {
    if (message) {
        var p = err.stack.indexOf(err.message);
        p += err.message.length;
        err.stack = err.stack.slice(0, p) + ": " + message + err.stack.slice(p);
        err.message += ": " + message;
    }
    return err;
}

function contains( a, b, asStrict ) {
    return __contains.contains(a, b, asStrict);
}

function within( a, b, distance ) {
    if (distance < 0) distance = -distance;
    return (a < b) ? (b - a <= distance) : (a - b <= distance);
    // note: same as (a < b) ? inorder([b - distance, a])
}

// returns `true`, else a number (the offset of the out-of-order element pair)
function inorder( args, compar ) {
    if (!compar) compar = function(a, b) { return a > b ? 1 : 0 }

    for (var i=0; i<args.length - 1; i++) {
        if (compar(args[i], args[i+1]) > 0) return i;
    }
    return true;
}

// FIXME: spliced-in error sometimes overwrites last char of previous message ?

// FIXME: error says "undefined contains 'fn2'" ie set being searched is not printed
