/**
 * Copyright (C) 2015-2017 Andras Radics
 * Licensed under the Apache License, Version 2.0
 */

'use strict';

var assert = require('assert');
var qassert = require('./');

// can parse package.json
require('./package.json');

// qassert, qassert.ok and qassert.assert are all the same
var called = false;
assert.equal(qassert.ok, qassert.assert);
assert(qassert.toString().indexOf("return module.exports.assert") >= 0);
assert(qassert.toString().indexOf("return module.exports.assert") == qassert.toString().lastIndexOf("return module.exports.assert"));

// exports AssertionError
// NOTE: how to construct a new instance?
assert(qassert.AssertionError == assert.AssertionError)

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
// fail merges in user message
try {
    qassert.fail("deliberate failure");
} catch (err) {
    qassert.contains(err.message, "test does not pass: deliberate failure");
}

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

// within does not throw if true
var ac = qassert.assertionCount;
assert.doesNotThrow(function(){ qassert.within(1, 2, 1) });
assert.doesNotThrow(function(){ qassert.within(-1, -2, 1) });
assert.doesNotThrow(function(){ qassert.within(-1, -2, -1) });
assert.equal(qassert.assertionCount, ac + 3);
assert.doesNotThrow(function(){ qassert.within(-1, 2, 3) });
assert.doesNotThrow(function(){ qassert.within(-1, 0, 1) });
assert.doesNotThrow(function(){ qassert.within(1, 2, 1e6) });
assert.doesNotThrow(function(){ qassert.within(0.1, 0.9, 0.8) });

// within throws if not true
assert.throws(function(){ qassert.within(-1, 1, 1.999) });
assert.throws(function(){ qassert.within(-1, 0, 0.999) });
assert.throws(function(){ qassert.within(1, 2, .5) });

// inorder does not throw if true
assert(qassert.inorder([1]));
assert(qassert.inorder([1, 1]));
assert(qassert.inorder([1, 2, 3]));
assert(qassert.inorder([1, 2, 2, 3], function(a,b) { return a - b }));
assert(qassert.inorder([2, 1, 1, 0], function(a,b) { return b - a }));
assert(qassert.inorder(["a", "aa", "b"]));
assert(qassert.inorder([{x:1}, {x:2}, {x:3}], function(a,b) { return a.x - a.x }));

// inorder throws if not true
assert.throws(function(){ qassert.inorder([2, 1]) });
assert.throws(function(){ qassert.inorder([1, 2], function(a,b) { return b - a }) });
assert.throws(function(){ qassert.inorder(["a", "b", "aa"]) });


// TODO:
// contains() test for inclusion
assert(qassert.contains(1, 1));
assert(qassert.contains(1, "1"));
assert(qassert.contains([1], "1"));
assert(qassert.contains(1, true));
assert(qassert.contains("123", 2));
assert(qassert.contains("foobar", "foo"));
assert(qassert.contains("foobar", "oba"));
assert(qassert.contains("foobar", "bar"));
assert(qassert.contains(new Buffer("123"), 2));
assert(qassert.contains(new Buffer("foobar"), "foo"));
assert(qassert.contains(new Buffer("foobar"), "oba"));
assert(qassert.contains(new Buffer("foobar"), "bar"));
assert(qassert.contains(new Buffer("foobar"), new Buffer("foo")));
assert(qassert.contains(new Buffer("foobar"), new Buffer("oba")));
assert(qassert.contains(new Buffer("foobar"), new Buffer("bar")));
assert(qassert.contains({a:1, b:2}, 2));
assert(qassert.contains([1, 2, 3], 2));
assert(qassert.contains([1, {b:2}, 3], {b:2}));
assert(qassert.contains([1,2,3], [1,3]));
assert(qassert.contains({a:1, b:2, c:3}, 2));
assert(qassert.contains({a:1, b:2, c:3}, {b:2}));
assert(qassert.contains([{a:1}, {a:1, b:2}, {b:2, c:3}], {b:2}));
assert(qassert.contains([{a:1}, {a:1, b:2}, {b:2, c:3}], [{b:2}, {c:3}]));
// does not contain
assert.throws(function(){ qassert.contains(1, 2) });
assert.throws(function(){ qassert.contains(1, 2) });
assert.throws(function(){ qassert.contains(1, 2) });
assert.throws(function(){ qassert.contains([1, {b:2}, 3], 2) });
assert.throws(function(){ qassert.contains([1, {b:2}, 3], {b:3}) });
assert.throws(function(){ qassert.contains([1,2,3], [1,4]) });
assert.throws(function(){ assert(qassert.contains([{a:1, b:2}, {a:1}], 2)) });
assert.throws(function(){ assert(qassert.contains([{a:1, b:2}, {a:1}], {c:2})) });
assert.throws(function(){ assert(qassert.contains([{a:1}, {a:1, b:2}, {b:2, c:3}], [{a:2}, {c:3}])) });
assert.throws(function(){ assert(qassert.contains({a:1, b:2, c:3}, 4)) });
assert.throws(function(){ assert(qassert.contains({a:1, b:2, c:3}, {a:2})) });
// strictContains()
assert(qassert.strictContains(1, 1));
assert(qassert.strictContains("foo", "foo"));
assert(qassert.strictContains(true, true));
assert(qassert.strictContains([1,2,3], 2));
assert(qassert.strictContains({a:1, b:2, c:3}, 2));
assert(qassert.strictContains({a:1, b:2, c:3}, {b:2, c:3}));
// does not strictContains()
assert.throws(function(){ qassert.strictContains(1, "1") });
assert.throws(function(){ qassert.strictContains(1, true) });
assert.throws(function(){ qassert.strictContains("true", true) });
assert.throws(function(){ qassert.strictContains("123", 2) });
assert.throws(function(){ qassert.strictContains(new Buffer("123"), 2) });
assert.throws(function(){ qassert.strictContains([1,2,3], [2,4]) });
// notContains
assert(qassert.notContains([1,2], 3));
// does not notContains
assert.throws(function(){ assert(qassert.notContains([1,2,3], 3)) });
// notStrictCOntains
if (parseFloat(process.version.slice(1)) > 4) {
assert(qassert.notStrictContains(["1",2], 1));
// does not notStrictContains
assert.throws(function(){ assert(qassert.notStrictContains(["1",2], "1")) });
}

// annotates error
try {
    qassert.equal(1, 2, "should not equal");
    assert(false);
} catch (err) {
    assert(err.message.indexOf('1 == 2: should not equal') >= 0);
}

// check that other qassert methods invoke the same-named method on assert
var savedAssert = {};
for (var k in assert) savedAssert[k] = assert[k];
for (var k in assert) assert[k] = function(a, b){ return "delegated " + a + " " + b };

if (qassert.equal(1, 2) != "delegated 1 2") throw new Error("equal was not delegated");
if (qassert.notEqual(1, 2) != "delegated 1 2") throw new Error("notEqual was not delegated");
if (qassert.deepEqual(1, 2) != "delegated 1 2") throw new Error("deepEqual was not delegated");
if (qassert.notDeepEqual(1, 2) != "delegated 1 2") throw new Error("notDeepEqual was not delegated");
if (qassert.deepStrictEqual(1, 2) != "delegated 1 2") throw new Error("deepEqual was not delegated");
if (qassert.notDeepStrictEqual(1, 2) != "delegated 1 2") throw new Error("notDeepEqual was not delegated");
if (qassert.strictEqual(1, 2) != "delegated 1 2") throw new Error("strictEqual was not delegated");
if (qassert.notStrictEqual(1, 2) != "delegated 1 2") throw new Error("notStrictEqual was not delegated");
if (qassert.throws('fn') != "delegated fn undefined") throw new Error("throws was not delegated");
if (qassert.throws('fn', {}) != "delegated fn [object Object]") throw new Error("throws was not delegated");
if (qassert.throws('fn', 'err') != "delegated fn err") throw new Error("throws was not delegated");
if (qassert.throws('fn', 'err', 'msg') != "delegated fn err") throw new Error("throws was not delegated");
if (qassert.doesNotThrow('fn') != "delegated fn undefined") throw new Error("doesNotThrow was not delegated");

// delegates deepEqual if deepStrictEqual is not available
delete assert.deepStrictEqual;
assert.equal(typeof qassert.deepStrictEqual(), 'function');
qassert.deepStrictEqual([1,2], [1,2]);
qassert.strictContains([1,2,3], 2);

delete assert.notDeepStrictEqual;
assert.equal(typeof qassert.notDeepStrictEqual(), 'function');
qassert.notDeepStrictEqual([1,2], [1,3]);

console.log("ok");
