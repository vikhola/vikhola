'use strict'

const { Stream } = require('stream')

class HttpBody {

    constructor(content) {
        this._type = undefined
        this._content = undefined
        this.content = content
    }

    get type() {
        return this._type
    }

    get content() {
        return this._content
    }

    set content(content) {

        if(content == null) {
            this._type = undefined
            this._content = undefined
            return
        } else if(typeof content === 'string') {
            this._type = 'text'
        } else if(Buffer.isBuffer(content)) {
            this._type = 'bin'
        } else if(content instanceof Stream) {
            this._type = 'stream'
        } else {
            this._type = 'object'
        }

        this._content = content
    }

}

module.exports = { HttpBody }