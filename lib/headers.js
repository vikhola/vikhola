'use strict'

// Capitalize expression .replace(/^([a-z])|[-\s\t\r\n\f\v]+([a-z])/g, (e) => e.toUpperCase())

class HeaderNameInvalidError extends Error {
    constructor(name) {
        super(`Header name "${name}" is invalid.`)
    }
}

class HeaderValueInvalidError extends Error {
    constructor(name) {
        super(`Header "${name}" value cannot be null or undefined.`)
    }
}

const kHeaders = Symbol('kHeaders')

class HttpHeaders {

    constructor(headers = {}) {
        this[kHeaders] = new Map(Object.entries(headers))
    }

    get size() {
        return this[kHeaders].size
    }

    set(name, value) {

        if(typeof name === 'object') {
            Object.keys(name).forEach(item => this.set(item, name[item]))
        } else {

            this._validateName(name)
            this._validateValue(name, value)

            this[kHeaders].set(this._prepare(name), value)
        }

        return this
    }

    has(name) {
        return this[kHeaders].has(this._prepare(name))
    }

    get(name, alt) {

        if(name === undefined)
            return null

        const aHeader = this._prepare(name)

        if(!this[kHeaders].has(aHeader))
            return this.get(alt)  
        else 
            return this[kHeaders].get(aHeader)
    }

    delete(name) {
        return this[kHeaders].delete(this._prepare(name))
    }

    names() {
        return [ ...this[kHeaders].keys() ]
    }

    values() {
        return [ ...this[kHeaders].values() ]
    }

    clear() {
        this[kHeaders].clear()
    }

    [Symbol.iterator]() {
        return this[kHeaders].entries()
    }

    _validateName(name) {

        if(!(typeof name === 'string' && name.length !== 0 && /^[\^_`a-zA-Z\-0-9!#$%&'*+.|:~]+$/.test(name)))
            throw new HeaderNameInvalidError(name)

    }

    _validateValue(name, value) {

        if(value == null)
            throw new HeaderValueInvalidError(name)
        
    }

    _prepare(name) {
        return name.toLowerCase()
    }

}

module.exports = { HttpHeaders }