const assert = require("node:assert");
const { describe, it } = require('node:test');
const { HttpTrailers } = require('../lib/trailers.js')


describe('HttpTrailers test', function() {

    it('"size" option', function() {
        const trailers = [ 'foo', 'bar', 'baz' ]
        const aTrailers = new HttpTrailers()
        trailers.forEach(trailer => aTrailers.add(trailer))
        assert.strictEqual(aTrailers.size, 3)
    })

    describe('"add()" method', function() {

        it(`should add trailer`, function() {
            const trailer = 'foo'
            const aTrailers = new HttpTrailers()
            aTrailers.add(trailer)
            assert.deepStrictEqual([ ...aTrailers ], [ trailer ])
        })
    
        it(`should not add trailer if it already present`, function() {
            const trailer = 'foo'
            const aTrailers = new HttpTrailers()
            aTrailers.add(trailer).add(trailer)
            assert.deepStrictEqual([ ...aTrailers ], [ trailer ])
        })

        it(`should throw an Error when trailer name is not a string`, function() {
            const aTrailers = new HttpTrailers()
            assert.throws(_ => aTrailers.add(123), { message: `Trailer name "${123}" is invalid.` })
        })

        it(`should throw an Error when trailer name is empty string`, function() {
            const aTrailers = new HttpTrailers()
            assert.throws(_ => aTrailers.add(""), { message: `Trailer name "" is invalid.` })
        })

        it(`should throw an Error when trailer name is contain invalid chars`, function() {
            const aTrailers = new HttpTrailers()
            assert.throws(_ => aTrailers.add('foo bar'), { message: `Trailer name "${'foo bar'}" is invalid.` })
        })

        it(`should throw an Error when trailer name is invalid`, function() {
            const aTrailers = new HttpTrailers()
            assert.throws(_ => aTrailers.add('Content-Type'), { message: `Trailer name "${'Content-Type'}" is invalid.` })
        })
        
    }) 

    describe(`"has()" method test`, function() {

        it(`should return true if trailer name is present`, function() {
            const trailer = 'foo'
            const aTrailers = new HttpTrailers()
            aTrailers.add(trailer)
            assert.strictEqual(aTrailers.has('foo'), true)
        })

        it(`should return false if trailer name is not present`, function() {
            const trailer = 'foo'
            const aTrailers = new HttpTrailers()
            aTrailers.add(trailer)
            assert.strictEqual(aTrailers.has('bar'), false)
        })

    })

    describe(`"delete()" method test`, function() {

        it(`should delete trailer if present and return true`, function() {
            const trailer = 'foo'
            const aTrailers = new HttpTrailers()
            aTrailers.add(trailer)
            assert.strictEqual(aTrailers.delete('foo'), true)
            assert.strictEqual(aTrailers.has('foo'), false)
        })

        it(`should return false if trailer is not present`, function() {
            const trailer = 'foo'
            const aTrailers = new HttpTrailers()
            assert.strictEqual(aTrailers.delete('fo1'), false)
        })

    })

    it('"names()" method', function() {
        const trailers = [ 'foo', 'bar', 'baz' ]
        const aTrailers = new HttpTrailers()
        trailers.forEach(trailer => aTrailers.add(trailer))

        assert.deepStrictEqual(aTrailers.names(), trailers)
    })

    it('"clear()" method', function() {
        const trailers = [ 'foo', 'bar', 'baz' ]
        const aTrailers = new HttpTrailers()
        trailers.forEach(trailer => aTrailers.add(trailer))
        aTrailers.clear()
        assert.deepStrictEqual([ ...aTrailers ], [])
    })

    it('"[Symbol.iterator]()" method', function() {
        const trailers = [ 'foo', 'bar', 'baz' ]
        const aTrailers = new HttpTrailers()
        trailers.forEach(trailer => aTrailers.add(trailer))
        assert.deepStrictEqual([ ...aTrailers ], [ 'foo', 'bar', 'baz' ])
    })

})