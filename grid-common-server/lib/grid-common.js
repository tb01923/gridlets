const monads = require('control.monads')
    , Maybe = require('data.maybe')
    , maybeSequence = monads.sequence(Maybe)

const fs = require('fs')
const {map, filter, lensProp, propIs, head, view, pipe, uniq, reduce } = require('ramda')


//lenses
const inputChannelLens = lensProp('inputChannel')
const outputChannelLens = lensProp('outputChannel')
const isJustLens = lensProp('isJust')
const metadataLens = lensProp('metadata')
const gridTasksLens = lensProp('gridTasks')
const gridTasksSrcFileLens = lensProp('gridTasksSrcFiles')

//getters
const viewInputChannel = view(inputChannelLens)
const viewOutputChannel = view(outputChannelLens)
const viewMetadata = view(metadataLens)
const viewGridTasks = view(gridTasksLens)
const viewGridTasksSrcFileLens = view(gridTasksSrcFileLens)

// property checks
const isMetadata = propIs(Object,'metadata')
const isJust = view(isJustLens)


/*
 getChannelsFromGridTasks : given an array of gridTasks it retrieves the input and output channels from those gridTasks, elminates
 duplicates, and removes nulls

 getChannelsFromGridTasks :: [GridTask] -> [Just StreamChannel]
 */
const getChannelsFromGridTasks = (gridTasks) => {
    const inputChannels = map(viewInputChannel, gridTasks)
    const outputChannels = map(viewOutputChannel, gridTasks)
    const allChannels = inputChannels.concat(outputChannels)

    const filterUnique = pipe(filter(isJust), uniq)
    console.log(filterUnique(allChannels))
    return filterUnique(allChannels)
}

const checkFileExistence = (path) => {
    try {
        return fs.statSync(path).isFile();
    } catch (e) {
        return false;
    }
}

const getContext = (dependencyList) => {
    const GridTask = require('../../grid-common/lib/types/grid-task')
        , GridChannel = require('../../grid-common/lib/types/grid-channel')
        , env = require('env2')
        , path = require('path');

    // default context modules
    let context = {
        GridTask: GridTask,
        GridChannel: GridChannel,
        console: console,
        process: process,
        env: env,
        setInterval: setInterval,
        basePath: path.dirname(require.main.filename)
    };

    // append imported modules to context object
    dependencyList.forEach(function(entry) {
        context[entry.modName] = entry.moduleObj;
    });

    return context;
};

// instantiateTask :: string -> GridTask
const instantiateTask = function(code) {
    const vm = require('vm');

    const context = getContext(global.gridletContext); // Temporary solution
    const sandbox = vm.createContext(context);

    vm.createContext(sandbox);
    return vm.runInContext(code, sandbox);
}

// instantiateTaskOntoGridlet :: (Gridlet, string) -> Gridlet
const instantiateTaskOntoGridlet = function(gridlet, code) {
    return gridlet.addGridTask(instantiateTask(code));
}

/*
 getChannels: given a gridlet, it reads the gridTasks, retrieving the input and output channels from those gridTasks, elminiating
 duplicates, and converting to a Maybe of [string]

 getChannels :: Gridlet -> Just [StreamChannel]
 */
module.exports.getChannels = pipe(
    viewGridTasks                            // [GridTask]
    , getChannelsFromGridTasks               // [Just StreamChannel]
    , maybeSequence                          // Just [StreamChannel]
)

/*
 extractMetadata: given an array of objects, where some instances contain broker data while others contain topic
 metadata, identify those that contain metadata, take the first one and return the metadata property

 extractMetadata :: a Obj, b {metadata: c}, c Obj => [a,b] -> c
 */
module.exports.extractMetadata = pipe(
    filter(isMetadata),
    head,
    viewMetadata)

/*
 loadTasksFromSource: given a gridlet,

 loadTasksFromSource :: Gridlet -> Just [GridTask]
 */
module.exports.loadGridletTasksFromSource = (gridlet) => {
    const loadSource = pipe(
        viewGridTasksSrcFileLens                            // [String]
        , reduce(instantiateTaskOntoGridlet, gridlet)       // Gridlet
        , Maybe.of                                          // Just Gridlet
    )
    return loadSource(gridlet)
}

module.exports.loadGridTasksFromSource = instantiateTask