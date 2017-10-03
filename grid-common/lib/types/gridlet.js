const fs = require('fs')

module.exports = Gridlet

function Gridlet(name) {
    this.name = name
    this.gridTasks = []
    this.gridTasksSrcFiles = []
    this.gridContext = null
    this.metadata = null
}

Gridlet.of = function(name) {
    return new Gridlet(name)
}

Gridlet.prototype.addGridTask = function(gridTask) {
    this.gridTasks.push(gridTask)
    return this
}

Gridlet.prototype.addGridTaskSrcFile = function(gridTaskSrcFile) {
    const pwd =  process.cwd()
    const gridTaskSrc = fs.readFileSync(gridTaskSrcFile)
    this.gridTasksSrcFiles.push(gridTaskSrc.toString())
    return this
}

Gridlet.prototype.setContext = function(context) {
    this.gridContext = context
    return this
}