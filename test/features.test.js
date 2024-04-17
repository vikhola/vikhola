const assert = require("node:assert");
const { describe, it } = require('node:test');
const { HttpFeatures } = require('../lib/features.js')

describe('HttpFeatures test', function() {

    describe('"set()" method', function() {

        it(`should set feature name-value pair`, function() {
            const key = 'foo'
            const value = 'bar'
            const aFeatures = new HttpFeatures()
            aFeatures.set(key, value)
            assert.strictEqual(aFeatures.get(key), value)
        })

        it(`should not throw an Error when feature name is a string`, function() {
            const aFeatures = new HttpFeatures()
            assert.doesNotThrow(_ => aFeatures.set('foo', 'bar'), { message: `Features key should be type of string or symbol.` })
        })

        it(`should not throw an Error when feature name is a symbol`, function() {
            const aFeatures = new HttpFeatures()
            assert.doesNotThrow(_ => aFeatures.set(Symbol(), 'bar'), { message: `Features key should be type of string or symbol.` })
        })

        it(`should throw an Error when feature name is not a string or symbol`, function() {
            const aFeatures = new HttpFeatures()
            assert.throws(_ => aFeatures.set(123), { message: `Features key should be type of string or symbol.` })
        })
        
    }) 
    
    describe('"get()" method', function() {

        it(`should get feature value by name`, function() {
            const aFeatures = new HttpFeatures()
            assert.equal(aFeatures.set('foo', 'bar').get('foo'), 'bar')
        })

        it(`should get undefined when feature is not present`, function() {
            const aFeatures = new HttpFeatures
            assert.deepStrictEqual(aFeatures.get('bar'), undefined)
        })

    })

    describe(`"has()" method test`, function() {

        it(`should return "true" if feature name is present`, function() {
            const aFeatures = new HttpFeatures()
            assert.strictEqual(aFeatures.set('foo', 'bar').has('foo'), true)
        })

        it(`should return "false" if feature name is not present`, function() {
            const aFeatures = new HttpFeatures()
            assert.strictEqual(aFeatures.set('foo', 'bar').has('bar'), false)
        })

    })

    describe(`"remove()" method test`, function() {

        it(`should delete feature if present`, function() {
            const aFeatures = new HttpFeatures()
            aFeatures.set('foo', 'bar').remove('foo')
            assert.strictEqual(aFeatures.has('foo'), false)
        })


    })

})