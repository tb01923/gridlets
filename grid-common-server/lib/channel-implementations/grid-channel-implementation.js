"use strict"
const {curry} = require('ramda')

module.exports = GridChannelImplementation

function GridChannelImplementation(connectionString) { }

GridChannelImplementation.of = () => {
    throw "NOT_IMPLEMENTED GridChannelImplementationGridChannelImplementation.of"
}

GridChannelImplementation.prototype.createChannels = () => {
    throw "NOT_IMPLEMENTED GridChannelImplementationGridChannelImplementation.prototype.createChannels"
}
GridChannelImplementation.prototype.getMetaData = () => {
    throw "NOT_IMPLEMENTED GridChannelImplementation.prototype.getMetaData"
}

GridChannelImplementation.prototype.listen = () => {
    throw "NOT_IMPLEMENTED GridChannelImplementation.prototype.listen"
}

GridChannelImplementation.prototype.send = () => {
    throw "NOT_IMPLEMENTED GridChannelImplementation.prototype.send"
}

GridChannelImplementation.prototype.setMessageProcessed = () => {
    throw "NOT_IMPLEMENTED GridChannelImplementation.prototype.setMessageProcessed"
}