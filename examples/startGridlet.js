/**
 * Created by endrit on 16-11-14.
 */
const gridlet = require('../index').GridletFramework;

// Start Kafka Consumer (listener)
gridlet.start(
    'gridlets',
    {zookeeperConn: "localhost:2181"}
);