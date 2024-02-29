'use strict'

const { EventEmitter } = require('@vikhola/events');

class EventTargetTypeError extends Error {
    constructor() {
        super(`EventTarget "event" should be type of object.`)
    }
}

class EventTarget extends EventEmitter {

    constructor(options) {
        super(options)
    }

    rawListeners(eventName) {
        let name = undefined

        if(typeof eventName === 'object') 
            name = eventName.name
        else 
            name = eventName

        return super.rawListeners(name)
    }

    emit(event) {

        if(!this._validateEvent(event)) 
            return Promise.reject(new EventTargetTypeError)

        return super.emit(event)
    }

    _emit(event, listeners, args, callback) {
        const aTarget = this

        function next(listeners, index = 0) {
            let aListener;

            if(event.stopped === true)
                return callback()

            if((aListener = listeners[index++]) === undefined) 
                return callback()
            else
                return aListener.notify(aTarget, [ event ], error => error !== undefined ? callback(error) : next(listeners, index))    
        }

        if(event.serial === true)
            next(listeners)
        else 
            for(var i = 0, c = 0; i < listeners.length; i++) {

                if(event.stopped !== true)
                    listeners[i].notify(aTarget, [ event ], error => error || ++c === listeners.length ? callback(error) : null)

                else if(++c === listeners.length)
                    callback()

            }
            
    }

    _validateEvent(event) {
        return (typeof event === 'object')
    }

}

module.exports = { EventTarget }