const {map, lensIndex, lensProp, find, set : rSet, has, prop, view, curryN, groupBy, mapObjIndexed, values, pipe} = require('ramda')

const monads = require('control.monads')
const Task = require('data.task')

//todo: this needs to be a remote resource
const gridWorkerApi = require('../../grid-worker-server/lib/grid-worker-api')

const gridChannelFactory = require('../../grid-common-server/lib/grid-channel-factory')
    , {loadGridletTasksFromSource, loadGridTasksFromSource, getChannels, extractMetadata} = require('../../grid-common-server/lib/grid-common')


//lenses
const nameLens = lensProp('name')
const channelTypeLens = lensProp('channelType')
const metadataLens = lensProp('metadata')
const gridTasksSrcFileLens = lensProp('gridTasksSrcFiles')

//getters
const viewChannelName = view(nameLens)
const viewChannelType = view(channelTypeLens)
const viewMetadata = view(metadataLens)
const viewGridTasksSrcFile = view(gridTasksSrcFileLens)

// channel metadata helpers
const headLens = lensIndex(0);
const viewGridChannel = (channels) => view(headLens, channels); 
const brokerLens = lensProp('0'); 
const viewInBrokerChannelMetadata = (brokerData) => view(brokerLens, brokerData);

// getPartitionsByName ::  String -> [Object] -> Object
const getPartitionsByName = (partitionName) => (channel) => {
    if (channel.name === partitionName){
        return channel.partitions;
    }
    // there is imposable to have a channel without a partition
    // which starts at position 0 ??
    else return 0
};

//setters
const setMetadata = rSet(metadataLens)

//todo: channel paritioning needs tobe abstracted away from Kafka
const sendTaskSourceToWorker = (channelMetadata) => (gridTaskSrc) => {

    const gridTask =  loadGridTasksFromSource(gridTaskSrc);

    const gridTaskChannelMetadata = gridTask.inputChannel.value ? gridTask.inputChannel.value : gridTask.outputChannel.value

    let channelName = gridTaskChannelMetadata.name;

    // first let's retrieve channel metadata for a certain channel
    const inputChannelMetadata = viewGridChannel(channelMetadata)[channelName];
    // knowing that channel metadata consists of broker id, and inside it all other data are included
    // i.e.: {"channelA":{"0":{"topic":"channelA","partition":0,"leader":0,"replicas":[0],"isr":[0]}},
    const filteredChannelData = viewInBrokerChannelMetadata(inputChannelMetadata)

    const numberOfPartitions = getPartitionsByName(filteredChannelData.topic)(gridTaskChannelMetadata);
    // iterate through every partition of this topic
    for (let partition=0; partition < numberOfPartitions; partition++){
        gridWorkerApi.execute(gridTaskSrc)(partition)
    }
};

// loadGridTasks :: Gridlet -> [GridTask]
const loadGridTasks = (gridlet) => {
    const metadata = viewMetadata(gridlet)
    const sendTaskSourceToWorkerWithMetaData = sendTaskSourceToWorker(metadata)
    return map(
        sendTaskSourceToWorkerWithMetaData,
        viewGridTasksSrcFile(gridlet)
    )
}

// taskSequence :: [Task(b)] -> Task([b])
const taskSequence = monads.sequence(Task)

// createChannelsTask :: [GridChannel] -> Task [Object] (Object == channel metadata)
const createChannelsTask = (channels) => {
    const groupedChannels = groupBy(viewChannelType, channels)


    // createChannels :: {key1: [GridChannel], ...keyn: [GridChannel]} -> {key1: Task [channelNames : string]}
    const createChannels = mapObjIndexed((channelGroup, key, _) =>{
        const channelNames = map(viewChannelName, channelGroup)
        const channelFactoryMethod = gridChannelFactory["Kafka"]
        const channel = channelFactoryMethod()

        return channel.createChannels(false, channelNames).         // Task unit
            chain(() => channel.getMetaData(false, channelNames)).
            map(extractMetadata)                                   // Task [GridChannel]
    })

    // createChannelTask :: {key1: [GridChannel], ...keyn: [GridChannel]} -> Task [channelNames : string]
    const createChannelTask = pipe(createChannels, values, taskSequence)

    return createChannelTask(groupedChannels)
}


module.exports.execute = (gridlet) => {

    /*
     mergeWithGridlet : given the metadata and the reference to gridlet (closure) add the metadata to the gridlet

     mergeWithGridlet :: metadata -> Gridlet
     */
    const mergeWithGridlet = (metadata) => setMetadata(metadata, gridlet)

    if(!global.gridletContext){
        global.gridletContext = gridlet.gridContext;
    }

    loadGridletTasksFromSource(gridlet).                        // Just [GridTask]
        chain(getChannels).                                     // Just [GridChannel]
        chain(createChannelsTask).                              // Task [Object] (Object == channel metadata)
        map(mergeWithGridlet).                                  // Task Gridlet
        map(loadGridTasks).                                   // Task [GridTask]
        fork(
            console.error,
            (x) => console.log('Loaded Successfully on:' + new Date() + '\n\n')
        )
}
