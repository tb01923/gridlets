const {lensProp, set : rSet, view, pipe, curry, keys} = require('ramda')

const gridChannelFactory = require('../../grid-common-server/lib/grid-channel-factory')
    , {loadGridTasksFromSource} = require('../../grid-common-server/lib/grid-common')

// helpers
const noop = (x) => x
const doNothing = () => noop                            // a function that returns a noop function

//lenses
const partitionLens = lensProp('partition')
const isJustLens = lensProp('isJust')
const nameLens = lensProp('name')
const groupIdLens = lensProp('groupId')
const lengthLens = lensProp('length')

//getters
const viewChannelName = view(nameLens)
const viewLength = view(lengthLens)

//setters
const setConsumerClientGroup = rSet(groupIdLens)
const setPartition = rSet(partitionLens)

// property checks
const isJust = view(isJustLens)

// getNumPartitionsImpl :: Obj -> integer
const getNumPartitionsImpl = pipe(
    keys,
    viewLength
)


/*
 loadGridTask: given the topic metadata and a gridTask work to integrate it into the pipeline.  For input channels
    this entails setting up consumers, with proper consumer group naming. There should be one listener set up
    for each partition associated with an inputChannel.  The transform function works in two manners, simple where
    the function takes an object input and returns an object that is piped into the output channel automatically.  And
    complex where the transform takes two parameters an input object and the function necessary to pipe the next value
    into the output channel - in this case it is the application developers responsibility to perform that task. Lastly
    the output channel is written to, by randomly selecting an available partition.  Perhaps a round robin OR code for
    a smarter partition selection (via a method in GridTask) are good enhancements.

 loadGridTask :: obj -> GridTask -> GridTask
 */
// const loadGridTask = (channelMetadata) => (gridTaskSrc) => (partition) => {
const loadGridTask = (gridContext) => (gridTaskSrc) => (subChannel) => {

    const gridTask = loadGridTasksFromSource(gridContext,gridTaskSrc)

    /*
        this is an IOC pattern, where the GridChannel is asked to select an implementation (based on it's type), and
            is passed a dictionary mapping the channel types to underlying

     getChannelImplementation :: GridChannel -> Object (where object is a ChannelImplementation)
    */
    const getChannelImplementation = (streamChannel, channelName) =>
        streamChannel.getChannelType({
            Kafka: gridChannelFactory.getKafka
        }, channelName)

    // forward :: string -> obj -> unit
    const forward = (streamChannel) => (message) => {
        const channelName = viewChannelName(streamChannel)

        //message += " -- p(" + partition + ")"
        return getChannelImplementation(streamChannel, channelName).
            send(channelName, message, subChannel).
            fork(noop, noop)
    }

    /*
     next: if there is an outputChannel channel the next gridTask is to forward a message to that channel, otherwise
        do nothing

     next :: obj -> unit
     */
    const next = gridTask.outputChannel.cata({
        Just: forward,
        Nothing: doNothing
    })

    const setInputProcessedOnChannel = (streamChannel) => (message) => {
        const channelName = viewChannelName(streamChannel)
        return getChannelImplementation(streamChannel, channelName).
            setMessageProcessed(message).
            fork(noop, noop)
    }

    const setInputProcessed = gridTask.inputChannel.cata({
        Just: setInputProcessedOnChannel,
        Nothing: doNothing
    })

    /*
     executeTransform: if the gridTasks transform function expects two parameters invoke with the "next" function and
        the obj from the inputChannel.  In this case it is the responsibility of the application developer to call next
        on the transformed object, in order to pass it to the next gridTask.  If the gridTasks transform function takes a
        single parameter, pass only the object from the input channel. In this case the application developer doesn't
        need to pass the function to the "next" function, it is handled by the system.

     executeTransform:: obj -> unit
     */
    const executeTransform = (obj) => {
        if(gridTask.transform.length == 2){
            gridTask.transform(next, obj)
        } else {
            next(gridTask.transform(obj))
        }

        gridTask.inputChannel
            .chain(() => setInputProcessed(obj))
    }

    /*
     If there is more an inputChannel, we need to listen for a message before taking action, otherwise we can
        perform the transform immediately.
     */
    const listenForInput = (streamChannel) => {
        const channelName = streamChannel.name
        const consumerGroup = streamChannel.consumerGroup

        const channelImplementation = getChannelImplementation(streamChannel, channelName)

        const consumerOptions = (pipe(
            setConsumerClientGroup(consumerGroup),
            setPartition(subChannel)
        )({}));

        // todo: listen might not be queue agnostic
        channelImplementation.listen(channelName, consumerOptions).on('message', executeTransform)
    }

    gridTask.inputChannel.cata({
        Just: listenForInput,
        Nothing: executeTransform
    })

    return gridTask
}


/*
 execute: given a gridlet, it identifies all channels and creates those topics within kafka-channel, and loads all gridTasks
    listed within a gridlet to run in the current process.
 */
module.exports.execute = (gridContext) => (gridTask) => (subChannel) => {
    console.log('STARTING GRIDLET WORKER')
    loadGridTask(gridContext)(gridTask)(subChannel)
}