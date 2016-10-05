'use strict';

var assert = require('assert');
var qassert = require('./');

// can parse package.json
require('./package.json');

// qassert, qassert.ok and qassert.assert are all the same
var called = false;
assert.equal(qassert.ok, qassert.assert);
assert(qassert.toString().indexOf("return qassert.assert") >= 0);
assert(qassert.toString().indexOf("return qassert.assert") == qassert.toString().lastIndexOf("return qassert.assert"));

// assertions fail on falsy
assert.throws(function(){ qassert(0) });
assert.throws(function(){ qassert("") });
assert.throws(function(){ qassert(false) });
assert.throws(function(){ qassert(null) });
assert.throws(function(){ qassert(undefined) });
assert.throws(function(){ qassert(NaN) });

// assertions succeed on truthy
assert.doesNotThrow(function(){ qassert(1) });
assert.doesNotThrow(function(){ qassert(2.5) });
assert.doesNotThrow(function(){ qassert("a") });
assert.doesNotThrow(function(){ qassert({}) });
assert.doesNotThrow(function(){ qassert([]) });
assert.doesNotThrow(function(){ qassert(Infinity) });
assert.doesNotThrow(function(){ qassert(-Infinity) });

// fail always throws
assert.throws(function(){ qassert.fail() });

// ifError throws on falsy
assert.doesNotThrow(function(){ qassert.ifError(0) });
assert.doesNotThrow(function(){ qassert.ifError("") });
assert.doesNotThrow(function(){ qassert.ifError(false) });
assert.doesNotThrow(function(){ qassert.ifError(null) });
assert.doesNotThrow(function(){ qassert.ifError(undefined) });
assert.doesNotThrow(function(){ qassert.ifError(NaN) });

// ifError throws on truthy
assert.throws(function(){ qassert.ifError(new Error("deliberate error")) });
assert.throws(function(){ qassert.ifError(1) });
assert.throws(function(){ qassert.ifError(2.5) });
assert.throws(function(){ qassert.ifError("a") });
assert.throws(function(){ qassert.ifError({}) });
assert.throws(function(){ qassert.ifError([]) });
assert.throws(function(){ qassert.ifError(Infinity) });
assert.throws(function(){ qassert.ifError(-Infinity) });

// TODO:
// within() does a range test
// contains() test for inclusion

// check that other qassert methods invoke the assert method
var savedAssert = {};
for (var k in assert) savedAssert[k] = assert[k];
for (var k in assert) assert[k] = function(a, b){ return "delegated " + a + " " + b };

if (qassert.equal(1, 2) != "delegated 1 2") throw new Error("equal was not delegated");
if (qassert.notEqual(1, 2) != "delegated 1 2") throw new Error("notEqual was not delegated");
if (qassert.deepEqual(1, 2) != "delegated 1 2") throw new Error("deepEqual was not delegated");
if (qassert.notDeepEqual(1, 2) != "delegated 1 2") throw new Error("notDeepEqual was not delegated");
if (qassert.strictEqual(1, 2) != "delegated 1 2") throw new Error("strictEqual was not delegated");
if (qassert.notStrictEqual(1, 2) != "delegated 1 2") throw new Error("notStrictEqual was not delegated");
if (qassert.throws('fn') != "delegated fn undefined") throw new Error("throws was not delegated");
if (qassert.doesNotThrow('fn') != "delegated fn undefined") throw new Error("doesNotThrow was not delegated");
