'use strict'

const { STATUS_CODES } = require('http')
const { HttpBody } = require('./body.js');
const { EventTarget } = require('./target.js');
const { HttpRequest } = require('./request.js');
const { HttpResponse } = require('./response.js');
const { CommandPipeline } = require('./pipeline.js');
const { 
    RequestEventCommand, 
    PrepareRequestCommand,
    ControllerEventCommand, 
    ResponseEventCommand, 
    PrepareResponseCommand, 
    ErrorCommand,
    WarningEventCommand,
    FinishEventCommand,
    CriticalEventCommand,
    WritingCommand,
    ControllerCommand
} = require('./commands.js');

class RouteNotFoundError extends Error {
    constructor() {
        super('Route is not found.')
        this.status = 404
        this.response = STATUS_CODES[404]
    }
}

class KernelFeatures {

    constructor(target, pipeline) {
        this.target = target
        this.pipeline = pipeline
        this.request = undefined
        this.response = undefined
        this.requestBody = undefined
        this.responseBody = undefined
    }

}

class Kernel extends EventTarget {

    constructor(router) {
        super()
        this._router = router
        this._attributes = new Map() 
    }

    route(method, route, handler) {
        const aTarget = new EventTarget({ origin: this })

        this._router.on(method, route, handler)
        this._attributes.set(handler, { target: aTarget })

        return aTarget
    }
    
    callback() {

        return (request, response) => {

            const { params, handler } = this._router.find(request.method, request.url) || {}
            const { target } = handler !== undefined ? 
                this._attributes.get(handler) : { target: this }

            const aTarget = new EventTarget({ origin: target })
            const aPipeline = new CommandPipeline()
            const aFeatures = new KernelFeatures(aTarget, aPipeline)
            const aRequestBody = new HttpBody()
            const aResponseBody = new HttpBody()

            aFeatures.request = new HttpRequest(aFeatures, request, params, aRequestBody)
            aFeatures.response = new HttpResponse(aFeatures, response, aResponseBody)
            aFeatures.requestBody = aRequestBody
            aFeatures.responseBody = aResponseBody

            return this._callback(aPipeline, aFeatures, handler, response)
        } 

    }

    async _callback(pipeline, features, handler, response) {

        try {
    
            try {

                if(!handler) {
                    await pipeline.start(new RequestEventCommand(features));

                    if(!pipeline.stopped)
                        throw new RouteNotFoundError

                } else {
                    await pipeline.start([
                        new RequestEventCommand(features),
                        new PrepareRequestCommand(features),
                        new ControllerEventCommand(features), 
                        new ControllerCommand(features, handler)
                    ])
                }
                    
                await pipeline.start(new ResponseEventCommand(features))
                await pipeline.start(new PrepareResponseCommand(features))

            } catch(error) {

                try {
                    await pipeline.start(new ErrorCommand(features, error))
                } finally {
                    await pipeline.start(new PrepareResponseCommand(features))
                }

            } finally { 

                try {
                    
                    try {
                        await pipeline.start(new WritingCommand(features))
                    } finally {
                        response.end()
                    }

                } catch (error) {
                    await pipeline.start(new WarningEventCommand(features, error))
                } finally {
                    await pipeline.start(new FinishEventCommand(features))
                }

            } 

        } catch (error) {
            await pipeline.start(new CriticalEventCommand(features, error))
        } 
        
    }

}

module.exports = { Kernel }