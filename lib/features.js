'use strict'

const kFeatures = Symbol('kFeatures')

class FeaturesKeyInvalidError extends Error {
    constructor(name) {
        super(`Features key should be type of string or symbol.`)
    }
}

class HttpFeatures {

    constructor() {
        this[kFeatures] = new Map()
    }

    set(key, value) {

        if(!this._validateName(key))
            throw new FeaturesKeyInvalidError()

        this[kFeatures].set(key, value)
        return this
    }

    get(key) {
        return this[kFeatures].get(key)
    }

    has(key) {
        return this[kFeatures].has(key)
    }

    remove(name) {
        this[kFeatures].delete(name)
    }

    _validateName(name) {
        return typeof name === 'string' || typeof name === 'symbol'
    }

}

module.exports = { HttpFeatures }