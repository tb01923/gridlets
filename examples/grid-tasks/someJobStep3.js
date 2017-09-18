const log = (x) => {
    console.log(JSON.stringify(x))
    return x
}

/*
 concatenateDateLogAndTerminate :: obj -> obj

 this is the single parameter version of the callback, which will leverage the framework to forward
 the return value from this function into the channel
 */
const concatenateDateLogAndTerminate = (nextStep, obj) => {
    const msg = obj.value + " :: Step3"
    console.log(msg)
    return msg
}

const inputChannel = GridChannel.of('channelB') //.setConsumerGroup('testCG')

GridTask.
    of("some-job step-3").
    pipeInput(inputChannel).
    transformBy(concatenateDateLogAndTerminate)
