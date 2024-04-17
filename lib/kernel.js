'use strict'

const { Emitter } = require('./emitter.js');
const { KernelAbortController } = require('./controller.js');
const { HttpRequest } = require('./request.js');
const { HttpResponse } = require('./response.js');
const { HttpFeatures } = require('./features.js');
const { pipeline } = require('./pipeline.js');
const { 
    RequestAction,
    ControllerAction,
    ResponseAction,
    ErrorAction,
    WritingAction,
    FinishAction,
    WarningAction
} = require('./actions.js');

class KernelEmitter extends Emitter {

    constructor(options) {
        super(options)
    }

    _catch(error) {
        return WarningAction({ target: this }, error)
    }

}

class Kernel extends KernelEmitter {

    constructor(router) {
        super()
        this._router = router
        this._attributes = new Map() 
    }

    route(method, route, handler) {
        const aTarget = new KernelEmitter({ origin: this })

        this._router.on(method, route, handler)
        this._attributes.set(handler, { target: aTarget })

        return aTarget
    }
    
    callback() {

        return (request, response) => {

            const { params, handler } = this._router.find(request.method, request.url) || {}
            const { target } = handler != null ? this._attributes.get(handler) : { target: this }

            const aFeatures = new HttpFeatures()
            const aController = new KernelAbortController()
            const aRequest = new HttpRequest(aFeatures, request, params)
            const aResponse = new HttpResponse(aFeatures, response, aController)

            const aContext =  { 
                target, 
                request: aRequest, 
                response: aResponse, 
                features: aFeatures, 
                controller: handler, 
                abortController: aController 
            }

            pipeline(
                (callback, args) => pipeline(
                    (callback, args) => pipeline(
                        [ 
                            pipeline([ RequestAction, ControllerAction ], { signal: aController.signal }), 
                            pipeline([ ResponseAction ])
                        ], 
                    )(ErrorAction.bind(null, callback, args), args), 
                )(WritingAction.bind(null, callback, args), args), 
            )(FinishAction.bind(null, aContext), aContext)

        } 

    }

}

module.exports = { Kernel, KernelEmitter }