const kAbortSymbol = Symbol('aborted')

class KernelAbortSignal {

    constructor() {
        this[kAbortSymbol] = false
    }

    get aborted() {
        return this[kAbortSymbol]
    }
        
}

class KernelAbortController {

    constructor() {
        this._signal = new KernelAbortSignal()
    }

    get signal() {
        return this._signal
    }

    abort() {
        this._signal[kAbortSymbol] = true
        this._signal = new KernelAbortSignal()
    }

}

module.exports = { KernelAbortController }
