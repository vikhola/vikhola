function pipeline(commands, opts = {}) {

    if(!Array.isArray(commands))
        commands = [ commands ]

    function next(i, signal, callback, args, error) {
        let command = commands[i]

        if (error != null || i === commands.length || signal.aborted) 
            return callback(error)
        else
            return command(next.bind(null, i + 1, signal, callback, args), ...args)
    }

    return function executor(callback, ...args) {
        return next(0, opts.signal || { aborted: false }, callback, args)
    }

}

module.exports = { pipeline }