const Maybe = require('data.maybe')

const noop = (x) => x.value
const ofTypeOr = (type, def) => (obj) => {
    return (typeof(obj) == type) ? obj : def
}
const stringOrNull = ofTypeOr("string", null)
    , functionOrNoop = ofTypeOr("function", noop)

module.exports = GridTask

function GridTask(name) {
    this.name = name
    this.inputChannel = Maybe.fromNullable(null)
    this.outputChannel = Maybe.fromNullable(null)
    this.transform = noop
}

// GridTask.of :: String -> GridTask
GridTask.of = function(name) {
    return new GridTask(name)
}

// GridTask:pipeInput :: String -> GridTask
GridTask.prototype.pipeInput = function(channel){
    this.inputChannel = Maybe.fromNullable(channel)
    return this
}

// GridTask:transformBy :: (Obj -> Obj) -> GridTask
GridTask.prototype.transformBy = function(transform){
    this.transform = functionOrNoop(transform)
    return this
}

// initiatedBy is an alias of transformBy to make the Step definition more expressive
// GridTask:initiatedBy :: (Obj -> Obj) -> GridTask
GridTask.prototype.initiatedBy = GridTask.prototype.transformBy

// GridTask:pipeOutput :: String -> GridTask
GridTask.prototype.pipeOutput = function(channel){
    this.outputChannel = Maybe.fromNullable(channel)
    return this
}
