const Gridlet = require('../../index').Gridlet;

const context = [
    {modName: 'ramda', moduleObj: require('ramda')}
];

module.exports =
    Gridlet.of("someJob").
        addGridTaskSrcFile("grid-tasks/someJobStep1.js").
        addGridTaskSrcFile("grid-tasks/someJobStep2.js").
        addGridTaskSrcFile("grid-tasks/someJobStep3.js").
        setContext(context);
