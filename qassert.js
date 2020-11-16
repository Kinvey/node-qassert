/**
 * Copyright (C) 2015-2020 Andras Radics
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
    notContains: _notContains,
    strictContains: _strictContains,
    notStrictContains: _notStrictContains,
    within: _within,
    inorder: _inorder,

    // aliases
    equals: _equal,
    assert: _assert,
    contain: _contains,

    assertionCount: 0,
}

// export an assertion function decorated with the other assertions,
// and the assertionCount that is incremented whenever an assertion runs.
// Copying the assertion methods onto a different object will increment
// the assertionCount on the new host object.
module.exports = function( value ) {
    return module.exports.assert(value);
}
for (var k in qassert) module.exports[k] = qassert[k];
// make exports into struct, to speed access
_assert.prototype = module.exports;

function _fail(m) { fail("test", "failed", "test does not pass" + (m ? ": " + m : ""), "", _fail); };


function _assert(p, m) {
    // assertionCount must be a `this` property so we can re-attach the test methods to eg test runners
    if (this && this.assertionCount !== undefined) this.assertionCount += 1;
    if (!p) fail(p, "truthy", m, "is", _assert); }

// patch the assertion error to include the user message alongside the built-in inspected values
// assert() shows the user message instead of the inspected values, which is less than helpful
function _wrapAssertion( self, assertion, startStackFunction, message, actual, expected, operator ) {
    if (self && self.assertionCount !== undefined) self.assertionCount += 1;
    try {
        return assertion(actual, expected);
    }
    catch (err) {
        //fail(actual, expected, null, operator, startStackFunction);
        // modify the stack trace to omit qassert internal sources, and ensure that fields are populated
        err.actual = actual;
        err.operator = operator;
        err.expected = expected;
        Error.captureStackTrace(err, startStackFunction);
        throw annotateError(err, message);
    }
}
function _wrapTest( self, assertion, startStackFunction, message, actual, expected, operator ) {
    if (self && self.assertionCount !== undefined) self.assertionCount += 1;
    if (! assertion(actual, expected)) fail(actual, expected, message, operator, startStackFunction);
    return true;
}

function _equal(a,b,m) {
    return _wrapAssertion(this, assert.equal, _equal, m, a, b, '==') }
function _notEqual(a,b,m) {
    return _wrapAssertion(this, assert.notEqual, _notEqual, m, a, b, '!=') }
function _deepEqual(a,b,m) {
    return _wrapAssertion(this, assert.deepEqual, _deepEqual, m, a, b, 'deepEqual') }
function _notDeepEqual(a,b,m) {
    return _wrapAssertion(this, assert.notDeepEqual, _notDeepEqual, m, a, b, 'notDeepEqual') }
function _deepStrictEqual(a,b,m) {
    return _wrapAssertion(this, assert.deepStrictEqual || assert.deepEqual, _deepStrictEqual, m, a, b, 'deepStrictEqual') }
function _notDeepStrictEqual(a,b,m) {
    return _wrapAssertion(this, assert.notDeepStrictEqual || assert.notDeepEqual, _notDeepStrictEqual, m, a, b, 'notDeepStrictEqual') }
function _strictEqual(a,b,m) {
    return _wrapAssertion(this, assert.strictEqual, _strictEqual, m, a, b, '===') }
function _notStrictEqual(a,b,m) {
    return _wrapAssertion(this, assert.notStrictEqual, _notStrictEqual, m, a, b, '!==') }
function _throws(a,e,m) {
    if (this && this.assertionCount !== undefined) this.assertionCount += 1;
    try {
        if (e instanceof Error || e instanceof RegExp || typeof e === 'function') {
            // the expected e can be an Error, a RegExp, or a validator function (or, in newer node, an object)
            assert.throws(a, e);
        } else {
            if (m === undefined) m = e; // two-argument form
            assert.throws(a);
        }
    } catch (err) {
        // NOTE: nodejs rethrows the user error if it does not match the expected, even when a non-object
        // NOTE: It might be better to always fail from here with an AssertionError... TBD.
        // NOTE: without an AssertionError cannot distinguish test failure from code crash

        // node-v0.6 assigns the 'Missing expected exception' message to err.actual, not err.message
        var altMessage = findFirst([false, err.message, err.actual]); // fix node-v0.6 err.message, `false` added for code cov
        throw annotateError(err, m, altMessage);
    } }
function _doesNotThrow(a,m) {
    return _wrapAssertion(this, assert.doesNotThrow, _doesNotThrow, m, a, undefined, 'doesNotThrow') }
function _ifError(a,m) {
    return _wrapAssertion(this, assert.ifError, _ifError, m, a, 'truthy', 'Error is') }

// extensions
function _contains(a,b,m) {
    return _wrapTest(this, __contains.contains, _contains, m, a, b, 'contains') }
function _strictContains(a,b,m) {
    return _wrapTest(this, __contains.strictContains, _strictContains, m, a, b, 'strictContains') }
function _notContains(a,b,m) {
    return _wrapTest(this, __contains.notContains, _notContains, m, a, b, 'notContains') }
function _notStrictContains(a,b,m) {
    return _wrapTest(this, __contains.notStrictContains, _notStrictContains, m, a, b, 'notStrictContains') }
function _within(a,b,dist,m) {
    if (this && this.assertionCount !== undefined) this.assertionCount += 1;
    if (Math.abs(a - b) <= Math.abs(dist)) return true;
    fail(a, b, m, 'within ' + dist + ' of', _within);
}
function _inorder(a, compar, m) {
    if (m == undefined && typeof compar !== 'function') {
        m = compar;
        compar = null;
    }
    if (this && this.assertionCount !== undefined) this.assertionCount += 1;
    var ok = inorder(a, compar, m)
    if (ok === true) return true;
    fail(a[ok], a[ok+1], m, 'inorder', _inorder);
}

// wrapper assert.fail for more useful diagnostics
// Note that assert.fail throws a formatted error with these parameters,
// but that actual assertions have already thrown the right error
// and should not be re-failed.
function fail( actual, expected, message, operator, stackStartFunction ) {
    // node-v10 and up deprecate the multi-argument form of assert.fail, use AssertionError
    var err = new assert.AssertionError({
        // ensure a canonical "actual op expected: msg" error message
        message: actual + ' ' + operator + ' ' + expected + ': ' + (message || 'fail'),
        generatedMessage: message === undefined,
        actual: actual,
        expected: expected,
        operator: operator,
        stackStartFn: stackStartFunction
    })
    err.generatedMessage = (message === undefined);
    throw err;
}

// append to, instead of replacing the built-in diagnostic
// note that if throws() fails to match it rethrows the user-provided thrown item, which need not be an Error
function annotateError( err, appendToMessage, altMessage ) {
    if (err instanceof assert.AssertionError) {
        // some node-v0.8 errors do not populate err.message?? if so, supply the canonical
        // (the canonical message or altMessage will not be in the stack trace, so ok to use in replace)
        var msg = findFirst([err.message, altMessage, (err.actual + ' ' + err.operator + ' ' + err.expected)]);
        var annotatedMsg = msg + (appendToMessage ? ': ' + appendToMessage : '');
        err.stack = err.stack && err.stack.replace(msg, annotatedMsg);
        err.message = annotatedMsg;
        // err.code = findFirst([err.code, 'ERR_ASSERTION']); // TBD: ensure err.code set, even on older nodejs
    }
    return err;
}

// returns `true`, else a number (the offset of the out-of-order element pair)
function inorder( args, compar ) {
    if (!compar) compar = function(a, b) { return a > b ? 1 : 0 }

    for (var i=0; i<args.length - 1; i++) {
        if (compar(args[i], args[i+1]) > 0) return i;
    }
    return true;
}

// return the first element in the array
// this function implements a || b ... || z in a way that does not hurt test coverage
function findFirst( array, test ) {
    for (var i = 0; i < array.length; i++) if (array[i]) return array[i];
}
