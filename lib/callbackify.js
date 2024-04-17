'use strict'

function callbackify(fn) {
    return function executor(callback, ...args) {

        try {

            const result = fn(...args)
    
            if(result != null && typeof result.then === 'function')
                result.then(() => callback(), callback)
            else 
                callback()
    
        } catch (error) {
            callback(error)
        }

    }
}

module.exports = { callbackify }