# Sideways
Sideways is a streaming project leveraging Kafka as a messaging system devised while I was drinking wine in the part of California that the movie Sideways was filmed in.

### Usage
1 - Add it on package.json as:

`"gridlet": "git+ssh@bitbucket.org:perpetualtech/gridlet-framework.git#master"`

2 - Create a separate folder for storing Jobs and for storing Tasks

3 - Create Tasks in tasks folder e.g.
```javascript
const inputChannel = GridChannel.of('KAFKA TOPIC HERE');

const processNotification = (nextStep, kafkaMessage) => {
    // Do something you want
};

GridTask.
    of("Start ntf-processing").
    pipeInput(inputChannel).
    transformBy(processNotification);
```

4 - Create job as Gridlet and register Tasks to it. Also define the context that task need to run as in the example:
```javascript
const Gridlet = require('gridlet/lib/types/gridlet');

const context = [
    {varName: 'ramda', reqPath: 'ramda'},
    {varName: 'deliveryService', reqPath: 'service/delivery-service'}
];

module.exports = Gridlet.of("KafkaMessageStream").
                    addGridTaskSrcFile("distribute/grid-tasks/ntf-dupe-check-task.js").
                    setContext(context);
```

5 - Run the Gridlet framework like in the example:
```javascript
gridlet = require('gridlet');
gridlet.start({
    gridletsPath: './distribute/gridlets',
    zookeeperConn: 'localhost:2181'
});
```

### Changing the library on local environment
If you want to make changes on library and test them locally without committing them on repository, follow the steps below:

1 - Install the dependencies (probably may need sudo)
`npm install`

2 - After you have done any changes in order to test it by using in any other module, first, 
create a global copy of this library on your local environment (node_modules - probably may need sudo)
`gulp install`

3 - Use it on you code as a library e.g.
```javascript
gridlet = require('gridlet');
gridlet.start('./distribute/gridlets');
```

4 - No need to add it on package.json, since the previous step add the library on global node modules.