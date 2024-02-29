class CommandPipeline {

    constructor() {
        this._stopped = false
        this._command = undefined
    }

    get stopped() {
        return this._stopped
    }

    stop() {
        this._stopped = true
    }

    start(commands, ...args) {
        let index = 0
        let command

        this._stopped = false

        if(!Array.isArray(commands))
            return commands.execute(...args)

        this._command = commands

        const next = () => {

            if(this._stopped || (command = commands[index++]) == null) 
                return this._command = undefined

            const result = command.execute(...args)  

            if(result != null && typeof result.then === 'function')
                return result.then(_ => next())
            else
                return next()
        }

        return next()
    }

}

module.exports = { CommandPipeline }