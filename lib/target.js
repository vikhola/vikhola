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

    emit(event) {

        if(!this._validateEvent(event)) 
            return Promise.reject(new EventTargetTypeError)

        return super.emit(event.name, event)
    }

    _emit(eventName, listeners, args, callback) {
        const event = args[0]
        const aTarget = this

        function next(listeners, index = 0) {
            let aListener;

            if(event.stopped === true)
                return callback()

            if((aListener = listeners[index++]) === undefined) 
                return callback()
            else
                return aListener.notify(aTarget, args, error => error !== undefined ? callback(error) : next(listeners, index))    
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