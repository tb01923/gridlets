const {pipe} =  require('ramda')
const {tap} =  require(`${process.cwd()}/examples/gridlets/someGridlet/grid-tasks/some-library`)

/*
 concatenateDateLogAndTerminate :: obj -> obj

 this is the single parameter version of the callback, which will leverage the framework to forward
 the return value from this function into the channel
 */
const concatenateDateLogAndTerminate = pipe(
    (obj) => obj.value + '::Step3@(' + new Date() + ')',
    (msg) => msg.replace('::', '\n\t'),
    tap('logger')
)



const inputChannel = GridChannel.of('channelB') //.setConsumerGroup('testCG')

GridTask.
    of("some-job step-3").
    pipeInput(inputChannel).
    transformBy(concatenateDateLogAndTerminate)