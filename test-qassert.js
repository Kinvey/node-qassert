/**
 * Copyright (C) 2015-2018 Andras Radics
 * Licensed under the Apache License, Version 2.0
 */

'use strict';

var assert = require('assert');
var qassert = require('./');

var nodeMajorVersion = parseInt(process.version.slice(1));

// extracted from qibl:
var newBuf = eval('nodeMajorVersion < 10 ? Buffer : function(a, b, c) { return typeof(a) === "number" ? Buffer.allocUnsafe(a) : Buffer.from(a, b, c) }');

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
var ac = qassert.assertionCount;
assert.doesNotThrow(function(){ qassert(1) });
assert.doesNotThrow(function(){ qassert(2.5) });
assert.doesNotThrow(function(){ qassert("a") });
assert.doesNotThrow(function(){ qassert({}) });
assert.doesNotThrow(function(){ qassert([]) });
assert.doesNotThrow(function(){ qassert(Infinity) });
assert.doesNotThrow(function(){ qassert(-Infinity) });
assert.equal(qassert.assertionCount, ac + 7);

// fail always throws
assert.throws(function(){ qassert.fail() });
// fail merges in user message
try {
    qassert.fail("deliberate failure");
} catch (err) {
    qassert.contains(err.message, "test does not pass: deliberate failure");
}

// ifError throws on falsy
var ac = qassert.assertionCount;
assert.doesNotThrow(function(){ qassert.ifError(undefined) });
assert.doesNotThrow(function(){ qassert.ifError(null) });
if (nodeMajorVersion < 10) {
assert.doesNotThrow(function(){ qassert.ifError(0) });
assert.doesNotThrow(function(){ qassert.ifError("") });
assert.doesNotThrow(function(){ qassert.ifError(false) });
assert.doesNotThrow(function(){ qassert.ifError(NaN) });
assert.equal(qassert.assertionCount, ac + 6);
} else {
// node-v10 and up throw on falsy non-null errors, too
assert.throws(function(){ qassert.ifError(0) });
assert.throws(function(){ qassert.ifError("") });
assert.throws(function(){ qassert.ifError(false) });
assert.throws(function(){ qassert.ifError(NaN) });
assert.equal(qassert.assertionCount, ac + 6);
}

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
var ac = qassert.assertionCount;
assert(qassert.inorder([1]));
assert(qassert.inorder([1, 1]));
assert(qassert.inorder([1, 2, 3]));
assert.equal(qassert.assertionCount, ac + 3);
assert(qassert.inorder([1, 2, 2, 3], function(a,b) { return a - b }));
assert(qassert.inorder([2, 1, 1, 0], function(a,b) { return b - a }));
assert(qassert.inorder(["a", "aa", "b"]));
assert(qassert.inorder([{x:1}, {x:2}, {x:3}], function(a,b) { return a.x - a.x }));

// inorder throws if not true
assert.throws(function(){ qassert.inorder([2, 1]) });
assert.throws(function(){ qassert.inorder([1, 2], function(a,b) { return b - a }) });
assert.throws(function(){ qassert.inorder(["a", "b", "aa"]) });


// contains() test for inclusion
var ac = qassert.assertionCount;
assert(qassert.contains(1, 1));
assert(qassert.contains(1, "1"));
assert(qassert.contains([1], "1"));
assert.equal(qassert.assertionCount, ac + 3);
assert(qassert.contains(1, true));
assert(qassert.contains("123", 2));
assert(qassert.contains("foobar", "foo"));
assert(qassert.contains("foobar", "oba"));
assert(qassert.contains("foobar", "bar"));
assert(qassert.contains("foobar", /bar$/));
assert(qassert.contains(newBuf("123"), 2));
assert(qassert.contains(newBuf("foobar"), "foo"));
assert(qassert.contains(newBuf("foobar"), "oba"));
assert(qassert.contains(newBuf("foobar"), "bar"));
assert(qassert.contains(newBuf("foobar"), newBuf("foo")));
assert(qassert.contains(newBuf("foobar"), newBuf("oba")));
assert(qassert.contains(newBuf("foobar"), newBuf("bar")));
assert(qassert.contains(newBuf("foobar"), /bar$/));
assert(qassert.contains({a:1, b:2}, 2));
assert(qassert.contains([1, 2, 3], 2));
assert(qassert.contains([1, {b:2}, 3], {b:2}));
assert(qassert.contains([1,2,3], [1,3]));
assert(qassert.contains({a:1, b:2, c:3}, 2));
assert(qassert.contains({a:1, b:2, c:3}, {b:2}));
assert(qassert.contains([{a:1}, {a:1, b:2}, {b:2, c:3}], {b:2}));
assert(qassert.contains([{a:1}, {a:1, b:2}, {b:2, c:3}], [{b:2}, {c:3}]));
var rex = /foo/
assert(qassert.contains([rex, /bar/], rex));
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
assert.throws(function(){ qassert.contains("foo", "bar") });
assert.throws(function(){ qassert.contains("foo", /bar/) });
// strictContains()
var ac = qassert.assertionCount;
assert(qassert.strictContains(1, 1));
assert(qassert.strictContains("foo", "foo"));
assert.equal(qassert.assertionCount, ac + 2);
assert(qassert.strictContains(true, true));
assert(qassert.strictContains([1,2,3], 2));
assert(qassert.strictContains({a:1, b:2, c:3}, 2));
assert(qassert.strictContains({a:1, b:2, c:3}, {b:2, c:3}));
// does not strictContains()
assert.throws(function(){ qassert.strictContains(1, "1") });
assert.throws(function(){ qassert.strictContains(1, true) });
assert.throws(function(){ qassert.strictContains("true", true) });
assert.throws(function(){ qassert.strictContains("123", 2) });
assert.throws(function(){ qassert.strictContains(newBuf("123"), 2) });
assert.throws(function(){ qassert.strictContains([1,2,3], [2,4]) });
// notContains
assert(qassert.notContains([1,2], 3));
assert(qassert.notContains([1,2], {y:null}));
// does not notContains
assert.throws(function(){ assert(qassert.notContains([1,2,3], 3)) });
// notStrictCOntains
if (parseFloat(process.version.slice(1)) > 4) {
assert(qassert.notStrictContains(["1",2], 1));
// does not notStrictContains
assert.throws(function(){ assert(qassert.notStrictContains(["1",2], "1")) });
}

// throws, which must compar the provided sample if available
// test does throw the expected error
try { qassert.throws(function(){ /* no throw */ }, 'appended diagnostic') }
catch (e) { assert.ok(e.message.indexOf('appended diagnostic') > 0) }
try { qassert.throws(function(){ /* no throw */ }, 'invalid test-to', 'appended diagnostic') }
catch (e) { assert.ok(e.message.indexOf('appended diagnostic') > 0) }

qassert.throws(function() { throw new Error() });
qassert.throws(function() { throw 'string' });
qassert.throws(function() { throw false });
qassert.throws(function() { throw 0 });
qassert.throws(function() { throw 'non-object' });

try { qassert.throws(function(){ throw 'string A' }, 'expect string B') }
    catch (e) { assert.ok(e === 'string A') }

assert.doesNotThrow(function(){ qassert.doesNotThrow(function(){ /* does not throw */ }) });
assert.doesNotThrow(function(){ qassert.throws(function(){ throw new TypeError('test error') }, TypeError) });
// works when called as a function
assert.doesNotThrow(function(){ var testfn = qassert.throws; testfn(function(){ throw new TypeError('test error') }, TypeError) });
assert.doesNotThrow(function(){ qassert.throws(function(){ throw new TypeError('test error') }, /test er/) });
assert.doesNotThrow(function(){ qassert.throws(function(){ throw new TypeError('test error') }, function(e) { return e.message === 'test error' }) });
// NOTE: should not annotate non-AssertionError-s, since throws() re-throws the user error if it did not match the expected
// try { qassert.throws(function(){ throw new TypeError('test error') }, SyntaxError, 'appended diagnostic') }
// catch (e) { assert.ok(e.message.indexOf('appended diagnostic') > 0) }
// test does not throw or throws an unexpected error
assert.throws(function(){ qassert.throws(function(){ /* does not throw */ }) });
assert.throws(function(){ qassert.throws(function(){ throw new TypeError('test error') }, SyntaxError) });
assert.throws(function(){ qassert.throws(function(){ throw new TypeError('test error') }, /failure/) });
assert.throws(function(){ qassert.throws(function(){ throw new TypeError('test error') }, function(e) { return e.message === 'error' } ) });

// annotates error
try {
    qassert.equal(1, 2, "should not equal");
    assert(false);
} catch (err) {
    assert(err.message.indexOf('1 == 2: should not equal') >= 0);
}

// only methods increment the assertion count, functions do not
var ac = qassert.assertionCount;
qassert.ok.call(null, 1);
qassert.equal.call(null, 1, 1);
qassert.contains.call(null, [1, 2], 1);
qassert.within.call(null, 1, 2, 1);
qassert.inorder.call(null, [1, 2, 3]);
assert.equal(qassert.assertionCount, ac);

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
// throws does not delegate, it does its own arg checking
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
