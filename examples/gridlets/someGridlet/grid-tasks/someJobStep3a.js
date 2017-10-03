const log = (x) => {
    console.log(JSON.stringify(x))
    return x
}

/*
 concatenateDateLogAndTerminate :: obj -> obj

 this is the single parameter version of the callback, which will leverage the framework to forward
 the return value from this function into the channel
 */
const concatenateDateLogAndTerminate = function(obj ){
    const newObj = obj.value + " :: Step3a"
    log(newObj)
}

const inputChannel = GridChannel.of('channelB') //.setConsumerGroup('testCG')

GridTask.
    of("some-job step-3a").
    pipeInput(inputChannel).
    transformBy(concatenateDateLogAndTerminate)