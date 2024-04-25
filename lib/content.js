'use strict'

const { Stream } = require('stream')

class HttpContent {

    constructor(value) {

        this._value = value

        if(Buffer.isBuffer(value)) {
            this._type = 'bin'
        } else if(value instanceof Stream) {
            this._type = 'stream'
        } else {
            const type = typeof value
            this._type = type === 'string' ? (/^\s*</.test(value) ? 'html' : 'text') : type
        }

    }

    get type() {
        return this._type
    }

    get value() {
        return this._value
    }

}

module.exports = { HttpContent }