'use strict'

const http = require('http')
const { Kernel } = require('./kernel.js');

class Server extends Kernel {

    constructor(options = {}) {
        super(require('find-my-way')(
            {
                caseSensitive: options.caseSensitive,
                maxParamLength: options.maxParamLength,
                allowUnsafeRegex: options.allowUnsafeRegex,
                ignoreTrailingSlash: options.ignoreTrailingSlash,
                ignoreDuplicateSlashes: options.ignoreDuplicateSlashes,
            }), 
        )
    }

    get(path, handler) {
        return this.route('GET', path, handler)
    }

    head(path, handler) {
        return this.route('HEAD', path, handler)
    }
    
    post(path, handler) {
        return this.route('POST', path, handler)
    }
    
    put(path, handler) {
        return this.route('PUT', path, handler)
    }
    
    delete(path, handler) {
        return this.route('DELETE', path, handler)
    }
    
    options(path, handler) {
        return this.route('OPTIONS', path, handler)
    }
    
    patch(path, handler) {
        return this.route('PATCH', path, handler)
    }

    listen() {
        const server = http.createServer(this.callback())
        return server.listen(...arguments)
    }

}

module.exports = { Server }