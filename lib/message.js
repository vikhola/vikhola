'use strict'

// Capitalize expression .replace(/^([a-z])|[-\s\t\r\n\f\v]+([a-z])/g, (e) => e.toUpperCase())

const kHeaders = Symbol('kHeaders')

class HeaderNameInvalidError extends Error {
    constructor(name) {
        super(`Header name "${name}" is invalid.`)
    }
}

class HttpMessage {

    constructor(headers = {}) {
        this[kHeaders] = Object.assign({}, headers)
    }

    get headers() {
        return Object.assign({}, this[kHeaders])
    }

    setHeader(name, value) {

        if(typeof name === 'object') {
            Object.keys(name).forEach(item => this.setHeader(item, name[item]))
            return this
        } 

        if(!this._validateName(name))
            throw new HeaderNameInvalidError(name)
        
        this[kHeaders][name.toLowerCase()] = value
        
        return this
    }

    getHeader(name, alt) {
        return name == null ? undefined : this[kHeaders][name.toLowerCase()] || this.getHeader(alt)
    }

    hasHeader(name) {
        return this[kHeaders][name.toLowerCase()] != null
    }

    removeHeader(name) {
        delete this[kHeaders][name.toLowerCase()]
        return this
    }

    _validateName(name) {
        return typeof name === 'string' && name.length !== 0 && /^[\^_`a-zA-Z\-0-9!#$%&'*+.|:~]+$/.test(name)
    }

}

module.exports = { HttpMessage }