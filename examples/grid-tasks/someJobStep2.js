/*
 concatenateDateAndForward :: obj -> obj

 this is the single parameter version of the callback, which will leverage the framework to forward
 the return value from this function into the channel
 */
const concatenateDateAndForward = (nextStep, obj) => {
    nextStep(obj.value + " :: Step2")
    return obj.value + " :: Step2"
}

const inputChannel = GridChannel.of('channelA')
const outputChannel = GridChannel.of('channelB')

GridTask.of("some-job step-2").
    pipeInput(inputChannel).
    transformBy(concatenateDateAndForward).
    pipeOutput(outputChannel)