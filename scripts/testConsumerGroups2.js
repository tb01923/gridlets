"use strict"
const kafka = require('kafka-node');

const client = new kafka.Client('localhost:2181');
const Consumer = kafka.Consumer;


const listen = function(topics, consumerGroup) {
    const options = undefined || {groupId: consumerGroup}
    const consumer = new Consumer(client, topics, options);
    return consumer
}


listen([{topic: 'step1_channelOut', partition: 0}], 'testCG2').on('message', function(obj){
    console.log('pong', obj.value)
})

