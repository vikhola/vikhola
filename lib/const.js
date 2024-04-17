'use strict'

module.exports = {
    kError: 'error',
    kEvent: 'event',
    kHandler: Symbol('handler'),

    kTarget: Symbol('target'),
    kFeatures: Symbol('features'),
    kAbortController: Symbol('controller'),
    kPipeline: Symbol('pipeline'),
    kRequest: Symbol('request'),
    kRequestBody: Symbol('request.body'),
    kResponse: Symbol('response'),
    kResponseBody: Symbol('response.body'),

    kPrepareEvent: 'kernel.prepare',
    kRequestEvent: 'kernel.request',
    kResponseEvent: 'kernel.response',
    kControllerEvent: 'kernel.controller',
    kTrailersEvent: 'kernel.trailers',
    kSerializeEvent: 'kernel.serialize',
    kParseEvent: 'kernel.parse',
    kFinishEvent: 'kernel.finish',
    kErrorEvent: 'kernel.error',
    kWarningEvent: 'kernel.warning',
    kCriticalEvent: 'kernel.critical',
}