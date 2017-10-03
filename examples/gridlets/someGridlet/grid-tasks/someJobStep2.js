const concatenateDateAndForward = (obj) =>
    obj.value + '::Step2@(' + new Date() + ')'

const inputChannel = GridChannel.of('channelA')
const outputChannel = GridChannel.of('channelB')

GridTask.of("some-job step-2").
    pipeInput(inputChannel).
    transformBy(concatenateDateAndForward).
    pipeOutput(outputChannel)