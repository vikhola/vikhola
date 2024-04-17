'use strict'

const { EventEmitter } = require('@vikhola/events');

class EmitterTypeError extends Error {
    constructor() {
        super(`Emitter "event" should be type of object.`)
    }
}

class NewListenerEvent {

    constructor(name, event, listener, options) {
        this._name = 'newListener'
        this._event = event
        this._listener = listener
        this._options = options
    }

    get name() {
        return this._name
    }

    get event() {
        return this._event
    }

    get listener() {
        return this._listener
    }

    get options() {
        return this._options
    }

}

class RemoveListenerEvent {

    constructor(name, event, listener) {
        this._name = 'removeListener'
        this._event = event
        this._listener = listener
    }

    get name() {
        return this._name
    }

    get event() {
        return this._event
    }

    get listener() {
        return this._listener
    }

}

class Emitter extends EventEmitter {

    constructor(options) {
        super(options)
    }

    emit(event) {

        if(event === 'newListener') {
            event = new NewListenerEvent(...arguments)
        }

        if(event === 'removeListener') {
            event = new RemoveListenerEvent(...arguments)
        }
            
        if(!this._validateEvent(event)) 
            throw new EmitterTypeError

        return super.emit(event.name, event)
    }

    _emit(eventName, listeners, args) {
        let result
        const event = args[0]

        try {

            if(event.serial)
                result = this._serial(event, listeners, args)
            else 
                result = this._parallel(event, listeners, args)

            if(event.captureRejection === true && result != null && typeof result.then === 'function')
                return result.catch(error => this._catch(error)) 
            else 
                return result
  
        } catch (error) {

            if(event.captureRejection === true)
                this._catch(error)
            else
                throw error

        }
         
    }

    _catch(error) {
        return this.emit({ name: 'error', error: error })
    }

    _serial(event, listeners, args) {
        const that = this

        function next(listeners, index = 0) {
            let listener, result;

            if(event.stopped === true)
                return;

            if((listener = listeners[index++]) == null) 
                return;

            result = listener(that, args)

            if(result != null && typeof result.then === 'function')
                return result.then(next.bind(null, listeners, index))
            else 
                return next(listeners, index)

        }

        return next(listeners)
    }

    _parallel(event, listeners, args) {
        let result;
        const aPromises = []

        try {
            
            for(let i = 0; i < listeners.length; i++) {

                result = listeners[i](this, args)

                if(result != null && typeof result.then === 'function')
                    aPromises.push(result)

                if(event.stopped)
                    i = listeners.length

            }
    
        } catch (error) {
            
            if(!aPromises.length)
                throw error
    
            aPromises.push(Promise.reject(error))
            return Promise.all(aPromises)
        }

        if(aPromises.length > 0)
            return Promise.all(aPromises)
    }

    _validateEvent(event) {
        return (typeof event === 'object')
    }

}

module.exports = { NewListenerEvent, RemoveListenerEvent, Emitter }