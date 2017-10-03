/**
 * Created by endrit on 16-11-14.
 */
const gridlet = require('../index').GridletFramework;


// Start Kafka Consumer (listener)
gridlet.start(
    process.cwd() + '/examples/gridlets/someGridlet',
    {zookeeperConn: "localhost:2181"}
);