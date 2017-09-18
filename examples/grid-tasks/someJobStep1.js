"use strict"
const TWO_SECONDS = 2000

/*
 onIntervalAddDateAndForward :: int -> (obj -> unit), obj -> unit

 this is the two parameter version of the callback that requires you to handle the nextStep
 at the appropriate time, to forward messages into the channel. Since there is no input step
 and we want to trigger message on an interval we need to handle the nextStep on our own
 */
const onIntervalAddDateAndForward = (interval) => (nextStep, _) => {
    let i = 0
    setInterval(
        () => {
            const message = "Step1 Message("+ (i++) +") At(" +  new Date() + ")"
            nextStep(message)
        }
        , interval
    )
}

const outputChannel = GridChannel.of('channelA')

GridTask.of("some-job step-1").
    initiatedBy(onIntervalAddDateAndForward(TWO_SECONDS)).
    pipeOutput(outputChannel)