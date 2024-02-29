'use strict'

const kItems = Symbol('kItems')

const INVALID_TRAILERS = new Set([
    '',
    'transfer-encoding',
    'content-length',
    'host',
    'cache-control',
    'max-forwards',
    'te',
    'authorization',
    'set-cookie',
    'content-encoding',
    'content-type',
    'content-range',
    'trailer'
])

class TrailerNameInvalidError extends Error {
    constructor(name) {
        super(`Trailer name "${name}" is invalid.`)
    }
}

class HttpTrailers {

    constructor() {
        this[kItems] = new Set()
    }

    get size() {
        return this[kItems].size
    }

    add(name) {
        this._validateName(name)
        this[kItems].add(name)
        return this
    }

    has(name) {
        return this[kItems].has(name)
    }

    delete(name) {
        return this[kItems].delete(name)
    }

    names() {
        return [ ...this[kItems].keys() ]
    }

    clear() {
        this[kItems].clear()
    }

    [Symbol.iterator]() {
        return this[kItems].keys()
    }

    _validateName(name) {

        if(!(typeof name === 'string' && name.length !== 0 && /^[\^_`a-zA-Z\-0-9!#$%&'*+.|:~]+$/.test(name) && !INVALID_TRAILERS.has(name.toLowerCase())))
            throw new TrailerNameInvalidError(name)
 
    }

}

module.exports = { HttpTrailers }